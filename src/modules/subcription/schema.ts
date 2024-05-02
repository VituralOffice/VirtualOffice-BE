import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { PAYMENT_STATUS, SUBSCRIPTION_STATUS } from './constant';

export type SubscriptionDocument = Subscription & Document;

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
export class Subscription {
  @Prop({
    ref: 'User',
    type: Types.ObjectId,
  })
  user: string;
  @Prop({
    ref: 'Plan',
    type: Types.ObjectId,
  })
  plan: string;
  @Prop({
    type: SUBSCRIPTION_STATUS,
  })
  status: SUBSCRIPTION_STATUS;
  @Prop({
    type: PAYMENT_STATUS,
  })
  paymentStatus: PAYMENT_STATUS;
  @Prop({
    type: Date,
  })
  startDate: Date;
  @Prop({
    type: Date,
  })
  endDate: Date;
  @Prop()
  stripeSubscriptionId: string;
}
export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
export type SubscriptionModel = Model<Subscription>;
