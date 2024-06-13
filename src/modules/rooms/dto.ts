import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserEntity } from '../user/entity';
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
  @ApiProperty()
  @IsNotEmpty()
  plan: string;
}
export class QueryRoomDto {
  @ApiProperty()
  name?: string;
  @ApiProperty({
    description: `Query room created by user`,
  })
  owned?: boolean;
  @ApiProperty({
    description: `Query room created by user`,
  })
  active?: boolean;
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
export class ChangeRoomSettingDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  map: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  private: boolean;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  active: boolean;
}
export class TransferRoomDto {
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
export class RemoveMemberDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  user: string;
}
