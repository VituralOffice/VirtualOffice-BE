import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

export type PlanDocument = Plan & Document;

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
export class Plan {
  @Prop({
    required: true,
  })
  name: string;
  @Prop({
    required: true,
    default: false,
  })
  free: boolean;
  @Prop({
    required: true,
  })
  maxRoom: number;
  @Prop({
    required: true,
  })
  maxRoomCapacity: number;
  @Prop({
    required: true,
  })
  @Prop({
    default: 'USD',
  })
  currency: string;
  @Prop({
    required: true,
  })
  monthlyPrice: number; // monthly price
  @Prop({
    required: true,
  })
  annuallyPrice: number;
  @Prop()
  monthlyPriceId: string; // stripe price id
  @Prop()
  annuallyPriceId: string; // stripe price id
  @Prop()
  features: string[];
}
export const PlanSchema = SchemaFactory.createForClass(Plan);
export type PlanModel = Model<Plan>;
