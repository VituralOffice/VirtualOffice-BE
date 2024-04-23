import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserEntity } from '../user/entity';
import { RoomEntity } from './entity/room';
import { RoomDocument } from './schema';

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
export class JoinRoomDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;
}
export type JoinRoomPayload = {
  room: RoomDocument;
  token: string;
  user: UserEntity;
};
