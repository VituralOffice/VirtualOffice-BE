import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { ChatMember } from './chatMember';

export type ChatDocument = Chat & Document;

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
export class Chat {
  @Prop({
    required: true,
  })
  name: string;
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  creator: string;
  @Prop({
    type: Types.ObjectId,
    ref: 'Room',
  })
  room: string;
  @Prop()
  type: string;
  @Prop({
    type: [ChatMember],
  })
  members: ChatMember[];
  @Prop({
    default: new Date().toISOString(),
    type: Date,
  })
  lastModifiedAt: Date;
}
export const ChatSchema = SchemaFactory.createForClass(Chat);
export type ChatModel = Model<Chat>;
