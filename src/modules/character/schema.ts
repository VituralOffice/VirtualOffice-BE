import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { getS3Url } from 'src/common/helpers/common';

export type CharacterDocument = Character & Document;

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
    virtuals: true,
  },
})
export class Character {
  @Prop()
  name: string;
  @Prop({
    get: (avatar: string) => getS3Url(avatar),
  })
  avatar: string;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);
export type CharacterModel = Model<Character>;
