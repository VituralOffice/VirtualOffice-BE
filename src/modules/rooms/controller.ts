import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RoomService } from './service';
import { CreateRoomDto, JoinRoomDto, QueryRoomDto } from './dto';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../user/entity';
import { ApiException } from 'src/common';
import { RoomEntity } from './entity/room';
import { RoomMember } from './schema/member';
import { ROLE } from 'src/common/enum/role';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { isNullOrUndefined } from 'util';
@ApiTags('rooms')
@Controller({
  path: 'rooms',
})
export class RoomController {
  constructor(private roomService: RoomService) {}
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
}
