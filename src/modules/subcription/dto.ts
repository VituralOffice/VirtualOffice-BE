import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { SUBSCRIPTION_STATUS } from './constant';

export class CreatePlanDto {
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({
    nullable: false,
    description: `Max room that user can create`,
  })
  @IsNotEmpty()
  @IsInt()
  maxRoom: number;
  @ApiProperty({
    nullable: false,
    description: `Max people in room`,
  })
  @IsNotEmpty()
  @IsInt()
  maxRoomCapacity: number;
  @ApiProperty({
    description: `List features`,
  })
  @IsArray()
  features: string[];
}
export class QuerySubscriptionDto {
  @ApiProperty({
    description: `Subscription status`,
    example: `status=pending,active,expired`,
  })
  status?: string;
}
