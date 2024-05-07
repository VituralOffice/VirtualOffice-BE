import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RoomService } from './service';
import { CreateRoomDto, InviteRoomDto, JoinRoomDto, QueryRoomDto } from './dto';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../user/entity';
import { ApiException } from 'src/common';
import { RoomEntity } from './entity/room';
import { RoomMember } from './schema/member';
import { ROLE } from 'src/common/enum/role';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { isNullOrUndefined } from 'util';
import { UserService } from '../user/service';
import { AddMemberChatDto, CreateChatDto, QueryChatDto } from '../chat/dto';
import { ChatService } from '../chat/service';
import { CHAT_TYPE } from '../chat/constant';
import { ChatDocument } from '../chat/schema/chat';

import { genChatName } from './helper';
import { ChatEntity } from '../chat/entity/chat';
import { ChatMember } from '../chat/schema/chatMember';
import { NotFoundRoomGuard } from './guard/room.guard';
import { NotFoundChatGuard } from './guard/chat.guard';
import { Chat } from 'src/common/decorators/chat';
@ApiTags('rooms')
@Controller({
  path: 'rooms',
})
export class RoomController {
  constructor(private roomService: RoomService, private userService: UserService, private chatService: ChatService) {}
  @Post()
  @ApiBody({ type: CreateRoomDto })
  async create(@Body() body: CreateRoomDto, @User() user: UserEntity) {
    const existName = await this.roomService.findByName(body.name);
    if (existName) throw new ApiException(`room name exist`, 400);
    const roomDoc = new RoomEntity();
    const member = new RoomMember();
    member.user = user.id;
    member.role = ROLE.ADMIN;
    roomDoc.name = body.name;
    roomDoc.private = body.private;
    roomDoc.map = body.map;
    roomDoc.creator = user.id;
    roomDoc.members = [member];
    const room = await this.roomService.create(roomDoc);
    return {
      result: room,
      message: `Success`,
    };
  }
  @Get()
  async getJoinedRooms(@Query() query: QueryRoomDto, @User() user: UserEntity) {
    const rooms = await this.roomService.findAllJoinedRoom(user, query);
    return {
      result: rooms,
      message: `Success`,
    };
  }
  @UseGuards(NotFoundRoomGuard)
  @Get(':roomId')
  async getRoom(@Param('roomId') roomId: string, @User() user: UserEntity) {
    const room = await this.roomService.findById(roomId);
    if (!room) throw new ApiException(`room not found`, 404);
    if (!(await this.roomService.checkUserInRoom(user, room)) && room.private)
      throw new ApiException(`user not in room`, 400);
    return {
      result: room,
      message: `Success`,
    };
  }

  @Post(':roomId/join_link')
  async joinLink(@Param('roomId') roomId: string, @User() user: UserEntity) {
    const room = await this.roomService.findById(roomId);
    if (!room) throw new ApiException(`room not found`, 404);
    const url = await this.roomService.genJoinLink(room);
    return {
      result: url,
      message: `Success`,
    };
  }
  @Post(':roomId/join')
  async joinRoom(@Param('roomId') roomId: string, @Body() body: JoinRoomDto, @User() user: UserEntity) {
    const room = await this.roomService.findById(roomId);
    if (!room) throw new ApiException(`room not found`, 404);
    if (!(await this.roomService.checkValidJoinRoomToken(roomId, body.token)))
      throw new ApiException(`token expired`, 400);
    if (await this.roomService.checkUserInRoom(user, room)) throw new ApiException(`user already in room`, 400);
    await this.roomService.joinRoom(room, user);
    return {
      result: null,
      message: `Success`,
    };
  }
  @Post(':roomId/invite')
  async invite(@Param('roomId') roomId: string, @Body() body: InviteRoomDto, @User() inviter: UserEntity) {
    const room = await this.roomService.findById(roomId);
    if (!room) throw new ApiException(`room not found`, 404);
    const user = await this.userService.findByEmail(body.email);
    if (user) {
      if (await this.roomService.checkUserInRoom(user, room)) throw new ApiException(`user already in room`, 400);
    }
    const url = await this.roomService.genJoinLink(room);
    console.log({ inviter });
    await this.roomService.sendJoinLink({
      email: body.email,
      url,
      inviterFullName: inviter.fullname || inviter.email,
      roomName: room.name,
    });
    return {
      result: null,
      message: `Success`,
    };
  }
  //********chat endpoints ********/
  @UseGuards(NotFoundRoomGuard)
  @Post(':roomId/chats')
  async createChat(@Body() body: CreateChatDto, @Param('roomId') roomId: string, @User() user: UserEntity) {
    const chat = new ChatEntity();
    const members: ChatMember[] = [];
    switch (true) {
      case body.type === CHAT_TYPE.GROUP || body.type === CHAT_TYPE.PUBLIC:
        chat.name = body.name || genChatName();
        const existName = await this.chatService.findByName(chat.name, roomId);
        if (existName) throw new ApiException(`chat name exist`);
        break;
      case body.type === CHAT_TYPE.PRIVATE:
        if (!body.members || body.members?.length === 0) throw new ApiException(`empty members`);
        break;
    }
    // validate member
    if (body.members?.length)
      await Promise.all(
        body.members.map(async (userId) => {
          const member = new ChatMember();
          const user = await this.userService.findById(userId);
          if (!user) throw new ApiException(`user not found`);
          member.role = `user`;
          member.user = user.id;
          members.push(member);
        }),
      );
    // creator member
    const creatorMember = new ChatMember();
    creatorMember.role = body.type === CHAT_TYPE.PRIVATE ? 'user' : 'admin';
    creatorMember.user = user.id;
    members.push(creatorMember);
    chat.creator = user.id;
    chat.room = roomId;
    chat.type = body.type;
    chat.members = members;
    const chatDoc = await this.chatService.create(chat);
    return {
      result: chatDoc,
      message: `Success`,
    };
  }
  @Get(':roomId/chats')
  @UseGuards(NotFoundRoomGuard)
  async getChats(@Query() query: QueryChatDto, @Param('roomId') roomId: string, @User() user: UserEntity) {
    const chats = await this.chatService.getAll(user, roomId, query);
    return {
      result: chats,
      message: `Success`,
    };
  }
  @UseGuards(NotFoundRoomGuard, NotFoundChatGuard)
  @Post(':roomId/chats/:chatId/members')
  async addMember(@Body() body: AddMemberChatDto, @Param('chatId') chatId: string, @User() user: UserEntity) {
    const chat = await this.chatService.findById(chatId);
    const userMember = chat.members.find((m) => m.user.toString() === user.id);
    if (!userMember) throw new ApiException(`forbidden`, 403);
    const newMember = await this.userService.findById(body.user);
    if (!newMember) throw new ApiException(`user not found`, 404);
    if (await this.chatService.checkUserInChat(newMember, chat)) throw new ApiException(`user has already in chat`);
    await this.chatService.addMember(chat, newMember);
    return {
      result: null,
      message: `Success`,
    };
  }
  @UseGuards(NotFoundRoomGuard, NotFoundChatGuard)
  @Delete(':roomId/chats/:chatId/members')
  async deleteMember(@Body() body: AddMemberChatDto, @Param('chatId') chatId: string, @User() user: UserEntity) {
    const chat = await this.chatService.findById(chatId);
    const userMember = chat.members.find((m) => m.user.toString() === user.id);
    if (!userMember || userMember.role !== 'admin') throw new ApiException(`forbidden`, 403);
    const newMember = await this.userService.findById(body.user);
    if (!newMember) throw new ApiException(`user not found`, 404);
    await this.chatService.deleteMember(chat, newMember);
    return {
      result: null,
      message: `Success`,
    };
  }
}
