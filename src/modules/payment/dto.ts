import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export enum BILLING_CYCLE {
  MONTH = 'month',
  YEAR = 'year',
}
export class CreateCheckoutDto {
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  planId: string;
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  billingCycle: BILLING_CYCLE;
}

export class RetryCheckoutDto {
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  subscriptionId: string;
}
