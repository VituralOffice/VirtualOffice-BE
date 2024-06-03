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
  status: string;
  @ApiProperty()
  @IsNotEmpty()
  paymentStatus: string;
  @ApiProperty({
    type: Date,
  })
  startDate: Date;
  @ApiProperty({
    type: Date,
  })
  endDate: Date;
  @ApiProperty()
  stripeSessionId: string;
  @ApiProperty()
  stripeSubscriptionId: string;
}
