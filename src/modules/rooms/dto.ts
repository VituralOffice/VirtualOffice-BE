import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  map: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
export class QueryRoomDto {
  @ApiProperty()
  name?: string;
}
