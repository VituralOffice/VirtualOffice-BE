import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { Message } from './message';
import { React } from './react';

export type ChatMessageDocument = ChatMessage & Document;

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
export class ChatMessage {
  @Prop({
    type: Types.ObjectId,
    ref: 'Chat',
  })
  chat: string;
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  user: string;
  @Prop({
    type: Message,
  })
  message: Message;
  @Prop({
    type: [React],
  })
  reacts: [React];
}
export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
export type ChatMessageModel = Model<ChatMessage>;
