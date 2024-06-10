import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMapDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  capacity: number;
  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  totalMeeting: number;
  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  totalChair: number;
  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  totalWhiteboard: number;
  @ApiProperty()
  default: boolean;
  @ApiProperty()
  style: string;
  @ApiProperty()
  icon: string;
  @ApiProperty()
  @IsNotEmpty()
  json: string;
}
export class UpdateMapDto {
  @ApiProperty()
  name?: string;
  @ApiProperty()
  @Transform(({ value }) => parseInt(value, 10))
  capacity?: number;
  @ApiProperty()
  @Transform(({ value }) => parseInt(value, 10))
  totalMeeting?: number;
  @ApiProperty()
  @Transform(({ value }) => parseInt(value, 10))
  totalChair?: number;
  @ApiProperty()
  @Transform(({ value }) => parseInt(value, 10))
  totalWhiteboard?: number;
  @ApiProperty()
  default?: boolean;
  @ApiProperty()
  style?: string;
  @ApiProperty()
  icon?: string;
  @ApiProperty()
  json?: string;
}
export class QueryMapDto {
  @ApiProperty()
  @IsOptional()
  @IsIn(['style']) //.... other
  groupBy?: string;
  @ApiProperty()
  @IsOptional()
  @IsIn(['capacity'])
  orderBy?: string;
}
