import { Inject, Injectable } from '@nestjs/common';
import { JOIN_ROOM_LINK_TTL, ROOM_MODEL } from './constant';
import { Room, RoomDocument, RoomModel } from './schema/room';
import { UserEntity } from '../user/entity';
import { RoomEntity } from './entity/room';
import { JoinRoomPayload, QueryRoomDto, SendJoinLinkPayload } from './dto';
import mongoose, { FilterQuery, UpdateQuery } from 'mongoose';
import { TokenService } from '../token/service';
import { ApiException } from 'src/common';
import { RoomMember } from './schema';
import { ROLE } from 'src/common/enum/role';
import { ICacheService } from '../cache/adapter';
import { randomHash } from 'src/common/crypto/bcrypt';
import { ISecretsService } from '../global/secrets/adapter';
import { MailerService } from '@nestjs-modules/mailer';
import { QueryDto } from '../admin/dto';
import { PaginateResult } from 'src/common/paginate/pagnate';
@Injectable()
export class RoomService {
  constructor(
    @Inject(ROOM_MODEL) private roomModel: RoomModel,
    private cacheService: ICacheService,
    private secretsService: ISecretsService,
    private mailerService: MailerService,
  ) {}
  async create(data: RoomEntity) {
    return this.roomModel.create(data);
  }
  async paginate(query: QueryDto) {
    const param: FilterQuery<Room> = {};
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    if (query.q) {
      param.name = { $regex: query.q, $option: 'i' };
    }
    const [data, total] = await Promise.all([
      this.roomModel
        .find(param)
        .populate([
          {
            path: 'map',
            select: `name`,
          },
          {
            path: 'creator',
            select: `fullname`,
          },
        ])
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: 'desc' }),
      this.roomModel.countDocuments(param),
    ]);
    return {
      page,
      limit,
      total,
      data,
    } as PaginateResult<RoomDocument>;
  }
  /**
   * @description Find all room user has joined
   */
  async findAllJoinedRoom(user: UserEntity, query: QueryRoomDto) {
    const param: FilterQuery<Room> = { members: { $elemMatch: { user: user.id } }, active: true };
    if (query.name) param.name = { $regex: `${query.name}`, $options: 'i' };
    if (query.owned) param.creator = user.id;
    if (query.active !== undefined) param.active = query.active;
    return this.roomModel.find(param).populate('map');
  }
  async findByName(name: string) {
    return this.roomModel.findOne({ name });
  }
  async findById(id: string | mongoose.Types.ObjectId) {
    return this.roomModel.findById(id);
  }
  async findByIdPopulate(id: string | mongoose.Types.ObjectId, populates: string[] = []) {
    return this.roomModel.findById(id).populate(populates);
  }
  async checkUserInRoom(user: UserEntity, room: RoomEntity) {
    const existRoom = await this.roomModel.findOne({ members: { $elemMatch: { user: user.id } }, _id: room.id });
    return !!existRoom;
  }
  async joinRoom(room: RoomDocument, user: UserEntity) {
    const newMember = new RoomMember();
    newMember.user = user.id;
    newMember.online = true;
    newMember.role = ROLE.USER;
    room.members.push(newMember);
    await room.save();
  }
  async genJoinLink(room: RoomEntity) {
    const token = randomHash();
    const key = `room_${room.id}_${token}`;
    await this.cacheService.set(key, room.id, { EX: JOIN_ROOM_LINK_TTL });
    const url = `${this.secretsService.APP_URL}/rooms/${room.id}/join?token=${token}`;
    return url;
  }
  async genTransferLink(room: RoomEntity) {
    const token = randomHash();
    const key = `room_transfer_${room.id}_${token}`;
    await this.cacheService.set(key, room.id, { EX: JOIN_ROOM_LINK_TTL });
    const url = `${this.secretsService.APP_URL}/rooms/${room.id}/ownership?token=${token}`;
    return url;
  }
  async leaveRoom(room: RoomEntity, user: UserEntity) {
    const updateQuery: UpdateQuery<Room> = {
      $pull: {
        members: [
          {
            user: user.id,
          },
        ],
      },
    };
    if (room.creator.toString() === user.id.toString()) {
      // if admin leave room change `active`: false,
      //todo: notify to member that room no longer active
      updateQuery['active'] = false;
    }
    await this.roomModel.updateOne(
      {
        _id: room.id,
      },
      updateQuery,
    );
  }
  async checkValidJoinRoomToken(roomId: string, token: string) {
    const key = `room_${roomId}_${token}`;
    return !!(await this.cacheService.get(key));
  }
  async sendJoinLink(payload: SendJoinLinkPayload) {
    // todo:
    return this.mailerService.sendMail({
      to: payload.email,
      from: `VOffice <${this.secretsService.smtp.from}>`,
      subject: 'Join room',
      template: 'joinRoom',
      context: {
        url: payload.url,
        inviter_fullname: payload.inviterFullName,
        room_name: payload.roomName,
      },
    });
  }
  async updateRoomMember(roomId: string, userId: string, payload: Partial<RoomMember>) {
    const updatePayload: any = {};
    if (payload.online !== undefined) {
      updatePayload['members.$.online'] = payload.online;
    }
    return this.roomModel.updateOne({ _id: roomId, 'members.user': userId }, { $set: updatePayload });
  }
  async removeMember(roomId: string, userId: string) {
    const updateQuery: UpdateQuery<Room> = {
      $pull: {
        members: [
          {
            user: userId,
          },
        ],
      },
    };
    return this.roomModel.updateOne({ _id: roomId }, updateQuery);
  }
  async countRoom(user: UserEntity) {
    return this.roomModel.countDocuments({
      creator: user.id,
    });
  }
}
