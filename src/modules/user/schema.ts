import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ROLE } from 'src/common/enum/role';

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
    required: true,
  })
  fullname: string;
  @Prop({})
  avatar: string;
  @Prop({
    default: ROLE.USER,
  })
  role: string;
  @Prop({
    required: true,
  })
  password: string;
  @Prop({
    default: false,
  })
  isVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
