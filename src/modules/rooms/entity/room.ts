import { ApiProperty } from '@nestjs/swagger';
import { Room } from '../schema/room';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { RoomMember } from '../schema/member';

export class RoomEntity extends Room {
  @ApiProperty()
  id?: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  map: string;

  @ApiProperty()
  @IsNotEmpty()
  creator: string;

  @ApiProperty()
  private: boolean;

  @ApiProperty()
  members: RoomMember[];
  @ApiProperty()
  plan: string;
}
