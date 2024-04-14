import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from 'src/modules/database/repository';
import { Model } from 'mongoose';

import { ITokenRepository } from './adapter';
import { Token, TokenDocument } from './schema';

@Injectable()
export class TokenRepository extends Repository<TokenDocument> implements ITokenRepository {
  constructor(@InjectModel(Token.name) private readonly entity: Model<TokenDocument>) {
    super(entity);
  }
}
