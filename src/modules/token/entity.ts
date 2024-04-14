import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { Token } from './schema';
import { TOKEN_TYPE } from './enum';

export class TokenEntity extends Token {
  @ApiProperty()
  id?: string;
  @ApiProperty()
  @IsNotEmpty()
  token: string;
  @ApiProperty()
  @IsNotEmpty()
  type: TOKEN_TYPE;
  @ApiProperty()
  isBlacklist: boolean;
}
