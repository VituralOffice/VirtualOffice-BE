import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';

export type ReactDocument = React & Document;

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
export class React {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  user: string;
  @Prop()
  type: string;
  @Prop()
  icon: string;
}
export const ReactSchema = SchemaFactory.createForClass(React);
export type ReactModel = Model<React>;
