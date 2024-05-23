import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { getS3Url } from 'src/common/helpers/common';

export type MessageDocument = Message & Document;

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
    getters: true,
  },
})
export class Message {
  @Prop()
  type: string;
  @Prop({
    default: '',
  })
  fileName: string;
  @Prop({
    default: '',
  })
  fileType: string;
  @Prop({
    default: '',
  })
  text: string;
  @Prop({
    default: '',
    get: (path: string) => {
      return getS3Url(path);
    },
  })
  path: string;
}
export const MessageSchema = SchemaFactory.createForClass(Message);
export type MessageModel = Model<Message>;
