import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Model } from 'mongoose';
import { ROLE } from 'src/common/enum/role';
import { User } from '../user/schema';
import { TOKEN_TYPE } from './enum';

export type TokenDocument = Token & Document;

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class Token {
  @Prop({ type: mongoose.Types.ObjectId, ref: `User` })
  user: string;
  @Prop({
    required: true,
  })
  token: string;
  @Prop({ required: true })
  type: TOKEN_TYPE;
  @Prop({
    default: false,
  })
  isBlacklist: boolean;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
export type TokenModel = Model<Token>;
