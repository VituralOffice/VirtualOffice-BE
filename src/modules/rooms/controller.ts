import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RoomService } from './service';
import { CreateRoomDto, QueryRoomDto } from './dto';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../user/entity';
import { ApiException } from 'src/common';
import { RoomEntity } from './entity/room';
import { RoomMember } from './schema/member';
import { ROLE } from 'src/common/enum/role';
import { ApiBody, ApiTags } from '@nestjs/swagger';
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
}
