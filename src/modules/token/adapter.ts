import * as jwt from 'jsonwebtoken';

import { SaveTokenPayload } from './types';

export abstract class ITokenService {
  abstract sign<T = jwt.SignOptions>(model: object, secret: string, options?: T): string;
  abstract verify<T = jwt.JwtPayload>(token: string, secret: string): Promise<T | string | unknown>;
  abstract decode<T = jwt.JwtPayload>(token: string): T | string | unknown;
  abstract save(data: SaveTokenPayload): Promise<TokenEntity>;
  /**
   *
   * @param userId
   * @description Revoke previous token after new login
   */
  abstract revoke(user: User): Promise<void>;
}

import { IRepository } from '../database/adapter';
import { TokenDocument } from './schema';
import { CreatedModel } from '../database/types';
import { User } from '../user/schema';
import { TokenEntity } from './entity';

export abstract class ITokenRepository extends IRepository<TokenDocument> {}
