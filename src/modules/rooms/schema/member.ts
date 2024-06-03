import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Model } from 'mongoose';
import { ROLE } from 'src/common/enum/role';

export type RoomMemberDocument = RoomMember & Document;

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  toJSON: {
    transform: function (doc, ret, opt) {
      delete ret['__v'];
      delete ret['updatedAt'];
      return ret;
    },
  },
})
export class RoomMember {
  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'User',
  })
  user: string;
  @Prop({
    default: false,
  })
  online: boolean;
  @Prop({
    default: false,
  })
  micStatus: boolean;
  @Prop({
    default: false,
  })
  videoStatus: boolean;
  @Prop({
    default: ROLE.USER,
  })
  role: string;
}

export const RoomMemberSchema = SchemaFactory.createForClass(RoomMember);
export type RoomMemberModel = Model<RoomMember>;
