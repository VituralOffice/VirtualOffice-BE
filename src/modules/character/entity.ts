import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, IsEmail } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Character } from './schema';

export class CharacterEntity extends Character {
  @ApiProperty()
  id?: string;
  @ApiProperty()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  avatar: string;
}
