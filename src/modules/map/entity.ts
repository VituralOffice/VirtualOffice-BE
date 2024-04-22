import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, IsEmail } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Map } from './schema';

export class MapEntity extends Map {
  @ApiProperty()
  id?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  fullname: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  @Exclude()
  password: string;
}
