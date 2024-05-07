import { Inject, Injectable } from '@nestjs/common';
import { JOIN_ROOM_LINK_TTL, ROOM_MODEL } from './constant';
import { Room, RoomDocument, RoomModel } from './schema/room';
import { UserEntity } from '../user/entity';
import { RoomEntity } from './entity/room';
import { JoinRoomPayload, QueryRoomDto, SendJoinLinkPayload } from './dto';
import mongoose, { FilterQuery } from 'mongoose';
import { TokenService } from '../token/service';
import { ApiException } from 'src/common';
import { RoomMember } from './schema';
import { ROLE } from 'src/common/enum/role';
import { ICacheService } from '../cache/adapter';
import { randomHash } from 'src/common/crypto/bcrypt';
import { ISecretsService } from '../global/secrets/adapter';
import { MailerService } from '@nestjs-modules/mailer';
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
  /**
   * @description Find all room user has joined
   */
  async findAllJoinedRoom(user: UserEntity, query: QueryRoomDto) {
    const param: FilterQuery<Room> = { members: { $elemMatch: { user: user.id } } };
    if (query.name) param.name = { $regex: `${query.name}`, $options: 'i' };
    if (query.owned) param.creator = user.id;
    return this.roomModel.find(param).populate('map');
  }
  async findByName(name: string) {
    return this.roomModel.findOne({ name });
  }
  async findById(id: string | mongoose.Types.ObjectId) {
    return this.roomModel.findById(id);
  }
  async checkUserInRoom(user: UserEntity, room: RoomEntity) {
    const existRoom = await this.roomModel.findOne({ members: { $elemMatch: { user: user.id } }, _id: room.id });
    return !!existRoom;
  }
  async joinRoom(room: RoomDocument, user: UserEntity) {
    const newMember = new RoomMember();
    newMember.user = user.id;
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
}
