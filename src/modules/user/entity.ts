import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, IsEmail } from 'class-validator';
import { Exclude } from 'class-transformer';
import { User } from './schema';

export class UserEntity extends User {
  @ApiProperty()
  id?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  @IsNotEmpty()
  role: string;

  @ApiProperty()
  @Exclude()
  password: string;
}
