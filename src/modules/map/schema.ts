import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Model } from 'mongoose';
import { OAUTH_PROVIDER } from 'src/common/enum/oauth-provider';
import { ROLE } from 'src/common/enum/role';

export type MapDocument = Map & Document;

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
export class Map {
  @Prop({ unique: true, index: true, required: true })
  name: string;
  @Prop()
  capacity: number;
  @Prop()
  totalMeeting: number;
  @Prop()
  totalChair: number;
}

export const MapSchema = SchemaFactory.createForClass(Map);
export type MapModel = Model<Map>;
