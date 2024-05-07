import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';

export type ChatMemberDocument = ChatMember & Document;

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
export class ChatMember {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  user: string;
  @Prop({
    default: 'user',
  })
  role: string;
}
export const ChatMemberSchema = SchemaFactory.createForClass(ChatMember);
export type ChatMemberModel = Model<ChatMember>;
