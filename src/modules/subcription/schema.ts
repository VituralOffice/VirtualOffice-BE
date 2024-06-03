import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { PAYMENT_STATUS, SUBSCRIPTION_STATUS } from './constant';
import { Plan } from '../plan/schema';
import { User } from '../user/schema';

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
  user: string | User;
  @Prop({
    default: false,
  })
  freePlan: boolean;
  @Prop({
    ref: 'Plan',
    type: Types.ObjectId,
  })
  plan: string | Plan;
  @Prop()
  billingCycle: string;
  @Prop()
  stripePriceId: string;
  @Prop({
    required: true,
  })
  total: number;
  @Prop({
    required: true,
    default: 'USD',
  })
  currency: string;
  @Prop({})
  status: string;
  @Prop({})
  paymentStatus: string;
  @Prop({
    type: Date,
  })
  startDate: Date;
  @Prop({
    type: Date,
  })
  endDate: Date;
  @Prop()
  stripeSessionId: string;
  @Prop()
  stripeSubscriptionId: string;
}
export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
export type SubscriptionModel = Model<Subscription>;
