import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Model } from 'mongoose';
import { OAUTH_PROVIDER } from 'src/common/enum/oauth-provider';
import { ROLE } from 'src/common/enum/role';
import { getS3Url } from 'src/common/helpers/common';

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
    getters: true,
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
  @Prop()
  totalWhiteboard: number;
  @Prop({
    default: false,
  })
  default: boolean;
  @Prop({
    default: '',
  })
  style: string;
  @Prop({
    default: '',
  })
  icon: string;
  @Prop({
    default: true,
  })
  active: boolean;
  @Prop({
    get: (json: string) => {
      return getS3Url(json);
    },
  })
  json: string;
}

export const MapSchema = SchemaFactory.createForClass(Map);
export type MapModel = Model<Map>;
