import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Model } from 'mongoose';
import { OAUTH_PROVIDER } from 'src/common/enum/oauth-provider';
import { ROLE } from 'src/common/enum/role';
import { Character } from '../character/schema';

export type UserDocument = User & Document;

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  toJSON: {
    transform: function (doc, ret, opt) {
      delete ret['password'];
      delete ret['__v'];
      delete ret['updatedAt'];
      return ret;
    },
  },
})
export class User {
  @Prop({ unique: true, index: true, required: true })
  email: string;
  @Prop({
    default: OAUTH_PROVIDER.LOCAL,
  })
  provider: string;
  @Prop()
  providerId: string;
  @Prop({
    default: '',
  })
  fullname: string;
  @Prop()
  avatar: string;
  @Prop({
    default: ROLE.USER,
  })
  role: string;
  @Prop({
    default: false,
  })
  isVerified: boolean;
  @Prop({ type: mongoose.Types.ObjectId, ref: `Character` })
  character: string | Character;
  @Prop({
    default: false,
  })
  online: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserModel = Model<User>;
