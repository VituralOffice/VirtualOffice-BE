import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Model } from 'mongoose';
import { RoomMember } from './member';

export type RoomDocument = Room & Document;

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
export class Room {
  @Prop({ unique: true, required: true })
  name: string;
  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'Map',
  })
  map: string;
  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'User',
  })
  creator: string;
  @Prop({
    type: [RoomMember],
  })
  members: RoomMember[];
  @Prop({
    default: false,
  })
  private: boolean;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
export type RoomModel = Model<Room>;
