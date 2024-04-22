import { Inject, Injectable } from '@nestjs/common';
import { ROOM_MODEL } from './constant';
import { Room, RoomDocument, RoomModel } from './schema/room';
import { UserEntity } from '../user/entity';
import { RoomEntity } from './entity/room';
import { QueryRoomDto } from './dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class RoomService {
  constructor(@Inject(ROOM_MODEL) private roomModel: RoomModel) {}
  async create(data: RoomEntity) {
    return this.roomModel.create(data);
  }
  /**
   *
   * @description Find all room user has joined
   */
  async findAllJoinedRoom(user: UserEntity, query: QueryRoomDto) {
    const param: FilterQuery<Room> = { members: { $elemMatch: { user: user.id } } };
    if (query.name) param.name = { $regex: `${query.name}`, $options: 'i' };
    return this.roomModel.find(param).populate('map');
  }
  async findByName(name: string) {
    return this.roomModel.findOne({ name });
  }
}
