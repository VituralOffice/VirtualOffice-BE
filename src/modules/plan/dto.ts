import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsString } from 'class-validator';

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
    description: `Monthly price`,
  })
  @IsNotEmpty()
  monthlyPrice: number;
  @ApiProperty({
    description: `Annually price`,
  })
  @IsNotEmpty()
  annuallyPrice: number;
  @ApiProperty({
    description: `Monthly stripe price id`,
  })
  monthlyPriceId: string;
  @ApiProperty({
    description: `Annually stripe price id`,
  })
  annuallyPriceId: string;
  @ApiProperty({
    description: `List features`,
  })
  @IsArray()
  features: string[];
}
