import { ApiProperty } from '@nestjs/swagger';
import { Subscription } from './schema';
import { IsInt, IsNotEmpty, IsString, isInt } from 'class-validator';
import { PAYMENT_STATUS, SUBSCRIPTION_STATUS } from './constant';

export class SubscriptionEntity extends Subscription {
  @ApiProperty()
  id?: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  user: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  plan: string;
  @ApiProperty()
  @IsNotEmpty()
  status: SUBSCRIPTION_STATUS;
  @ApiProperty()
  @IsNotEmpty()
  paymentStatus: PAYMENT_STATUS;
  @ApiProperty({
    type: Date,
  })
  startDate: Date;
  @ApiProperty({
    type: Date,
  })
  endDate: Date;
  @ApiProperty()
  stripeSubscriptionId: string;
}
