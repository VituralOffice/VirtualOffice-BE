import { HttpStatus, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ISecretsService } from 'src/modules/global/secrets/adapter';
import { ApiException } from 'src/common';

import { ITokenRepository, ITokenService as ITokenService } from './adapter';
import { SaveTokenPayload } from './types';
import { CreatedModel } from '../database/types';
import { User } from '../user/schema';
import { TokenEntity } from './entity';
import { JwtPayload } from '../auth/jwt/jwt.strategy';

@Injectable()
export class TokenService implements ITokenService {
  constructor(private readonly secret: ISecretsService, private tokenRepository: ITokenRepository) {}

  sign(payload: JwtPayload, secret: string, options?: jwt.SignOptions): string {
    const token = jwt.sign(
      payload,
      secret,
      options || {
        expiresIn: 300, // 5 minutes
      },
    );
    return token;
  }

  async verify(token: string, secret: string): Promise<jwt.JwtPayload | string> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (error, decoded) => {
        if (error)
          reject(new ApiException(error.message, HttpStatus.UNAUTHORIZED, `${TokenService.name}/${this.verify.name}`));
        resolve(decoded);
      });
    });
  }

  decode(token: string): jwt.JwtPayload | string {
    return jwt.decode(token);
  }
  save(data: SaveTokenPayload): Promise<TokenEntity> {
    return this.tokenRepository.create(data);
  }
  async revoke(user: User): Promise<void> {
    await this.tokenRepository.updateMany(
      {
        user,
      },
      { isBlacklist: true },
    );
    return;
  }
}
