import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, IsEmail } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Map } from './schema';

export class MapEntity extends Map {
  @ApiProperty()
  id?: string;
  @ApiProperty()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @IsNotEmpty()
  capacity: number;
  @ApiProperty()
  totalMeeting: number;
  @ApiProperty()
  totalChair: number;
  @ApiProperty()
  totalWhiteboard: number;
  @ApiProperty()
  default: boolean;
  @ApiProperty()
  style: string;
  @ApiProperty()
  icon: string;
  @ApiProperty()
  json: string;
}
