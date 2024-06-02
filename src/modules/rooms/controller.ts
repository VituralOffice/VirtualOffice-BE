import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RoomService } from './service';
import { CreateRoomDto, InviteRoomDto, JoinRoomDto, QueryRoomDto, RemoveMemberDto, TransferRoomDto } from './dto';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../user/entity';
import { ApiException } from 'src/common';
import { RoomEntity } from './entity/room';
import { RoomMember } from './schema/member';
import { ROLE } from 'src/common/enum/role';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/service';
import { AddMemberChatDto, CreateChatDto, QueryChatDto } from '../chat/dto';
import { ChatService } from '../chat/service';
import { CHAT_TYPE } from '../chat/constant';
import { genChatName } from './helper';
import { ChatEntity } from '../chat/entity/chat';
import { ChatMember } from '../chat/schema/chatMember';
import { NotFoundRoomGuard } from './guard/room.guard';
import { NotFoundChatGuard } from './guard/chat.guard';
import { SubscriptionService } from '../subcription/service';
import { PlanService } from '../plan/service';
import { Plan } from '../plan/schema';
import { IMapMessage } from 'src/types/IOfficeState';
import { convertToChatMessageSchema } from './VOffice';
import { MapMessage } from './schema/OfficeState';
@ApiTags('rooms')
@Controller({
  path: 'rooms',
})
export class RoomController {
  constructor(
    private roomService: RoomService,
    private userService: UserService,
    private chatService: ChatService,
    private subscriptionService: SubscriptionService,
    private planService: PlanService,
  ) {}
  @Post()
  @ApiBody({ type: CreateRoomDto })
  async create(@Body() body: CreateRoomDto, @User() user: UserEntity) {
    const existName = await this.roomService.findByName(body.name);
    if (existName) throw new ApiException(`room name exist`, 400);
    let activeSubscription = await this.subscriptionService.findActiveSubscription(user);
    // todo: optimize later
    // subscribe for free plan
    if (!activeSubscription) {
      const freePlan = await this.planService.findOne({ free: true });
      activeSubscription = await this.subscriptionService.subscribeFreePlan(user, freePlan);
    }
    // check room limit
    const totalRoom = await this.roomService.countRoom(user);
    await activeSubscription.populate(`plan`);
    if (totalRoom >= (activeSubscription.plan as Plan).maxRoom)
      throw new ApiException(`Reach limit room on plan, please subscribe for new plan`, 400);
    const roomDoc = new RoomEntity();
    const member = new RoomMember();
    member.user = user.id;
    member.role = ROLE.ADMIN;
    roomDoc.name = body.name;
    roomDoc.plan = body.plan;
    roomDoc.private = body.private;
    roomDoc.map = body.map;
    roomDoc.creator = user.id;
    roomDoc.members = [member];
    const room = await this.roomService.create(roomDoc);
    // create public chat in room
    await this.chatService.createLobbyChat(room, user);
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
    await room.populate(['map', 'members.user']);
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
    await this.chatService.addMemberToPublicChat(room, user);
    return {
      result: null,
      message: `Success`,
    };
  }
  @Post(':roomId/invite')
  async invite(@Param('roomId') roomId: string, @Body() body: InviteRoomDto, @User() inviter: UserEntity) {
    const room = await this.roomService.findById(roomId);
    if (!room) throw new ApiException(`room not found`, 404);
    const activeSubscription = await (await this.subscriptionService.findActiveSubscription(inviter)).populate('plan');
    console.log({
      activeSubscription,
      room,
    });
    if (room.members.length >= (activeSubscription.plan as Plan).maxRoomCapacity)
      throw new ApiException(`Reach limit room capacity on plan, please subscribe for new plan`, 400);
    const user = await this.userService.findByEmail(body.email);
    if (user) {
      if (await this.roomService.checkUserInRoom(user, room)) throw new ApiException(`user already in room`, 400);
    }
    const url = await this.roomService.genJoinLink(room);
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
  @Post(':roomId/leave')
  async leave(@Param('roomId') roomId: string, @User() user: UserEntity) {
    const room = await this.roomService.findById(roomId);
    if (!room) throw new ApiException(`room not found`, 404);
    await this.roomService.leaveRoom(room, user);
    return {
      result: null,
      message: `Success`,
    };
  }
  @Post(':roomId/remove')
  async remove(@Param('roomId') roomId: string, @Body() body: RemoveMemberDto, @User() user: UserEntity) {
    const room = await this.roomService.findById(roomId);
    if (!room) throw new ApiException(`room not found`, 404);
    if (room.creator.toString() !== user.id.toString()) throw new ApiException(`forbidden`, 403);
    await this.roomService.removeMember(roomId, user.id);
    return {
      result: null,
      message: `Success`,
    };
  }
  @Post(':roomId/transfer')
  async transferOwnership(@Param('roomId') roomId: string, @Body() body: TransferRoomDto, @User() user: UserEntity) {
    const room = await this.roomService.findById(roomId);
    if (!room) throw new ApiException(`room not found`, 404);
    if (room.creator.toString() !== user.id.toString()) throw new ApiException(`Forbidden`, 403);
    // todo!!!
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
        // const existName = await this.chatService.findByName(chat.name, roomId);
        // if (existName) throw new ApiException(`chat name exist`);
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
  async getAllUserChats(@Query() query: QueryChatDto, @Param('roomId') roomId: string, @User() user: UserEntity) {
    const chats = await this.chatService.getAll(user, roomId, query || new QueryChatDto());
    return {
      result: chats,
      message: `Success`,
    };
  }
  @Get(':roomId/chats/:chatId')
  @UseGuards(NotFoundRoomGuard)
  async getChatById(@Param('roomId') roomId: string, @Param('chatId') chatId: string, @User() user: UserEntity) {
    const chat = await this.chatService.getOne(user, roomId, chatId);
    return {
      result: chat,
      message: `Success`,
    };
  }
  @Get(':roomId/messages/:chatId')
  @UseGuards(NotFoundRoomGuard)
  async getMessagesByChatId(
    @Param('roomId') roomId: string,
    @Param('chatId') chatId: string,
    @User() user: UserEntity,
  ) {
    const chatMessages = await this.chatService.batchLoadChatMessages({
      chat: chatId,
      limit: 100,
    });
    const chatMessageSchemas = convertToChatMessageSchema(chatMessages.reverse());
    const mapMessage = new MapMessage();
    mapMessage._id = chatId;
    mapMessage.messages = chatMessageSchemas;
    return {
      result: mapMessage,
      message: `Success`,
    };
  }
  @Get(':roomId/messages')
  @UseGuards(NotFoundRoomGuard)
  async getUserChatsWithMessages(@Param('roomId') roomId: string, @User() user: UserEntity) {
    const chats = await this.chatService.getAll(user, roomId, new QueryChatDto());
    const mapChatMessages: IMapMessage[] = [];
    await Promise.all(
      chats.map(async (c) => {
        const chatMessages = await this.chatService.batchLoadChatMessages({
          chat: c.id,
          limit: 100,
        });
        const chatMessageSchemas = convertToChatMessageSchema(chatMessages.reverse());
        const mapMessage = new MapMessage();
        mapMessage._id = c.id;
        mapMessage.messages = chatMessageSchemas;
        mapChatMessages.push(mapMessage);
      }),
    );
    return {
      result: {
        chats,
        mapMessages: mapChatMessages,
      },
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
