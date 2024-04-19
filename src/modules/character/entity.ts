import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
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
