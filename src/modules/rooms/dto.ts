import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
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
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  private: boolean;
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
export class InviteRoomDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;
}
export type SendJoinLinkPayload = {
  email: string;
  inviterFullName: string;
  roomName: string;
  url: string;
};
