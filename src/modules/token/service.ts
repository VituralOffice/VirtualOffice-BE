import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ISecretsService } from 'src/modules/global/secrets/adapter';
import { ApiException } from 'src/common';

import { SaveTokenPayload } from './types';
import { TokenEntity } from './entity';
import { JwtPayload } from '../auth/jwt/jwt.strategy';
import { TOKEN_TYPE } from './enum';
import { TokenModel } from './schema';
import { TOKEN_MODEL } from './constant';

@Injectable()
export class TokenService {
  constructor(@Inject(TOKEN_MODEL) private tokenModel: TokenModel) {}
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

  async verify(token: string, secret: string) {
    try {
      const payload = jwt.verify(token, secret) as JwtPayload;
      const tokenDoc = await this.tokenModel.findOne({
        token: token,
        type: TOKEN_TYPE.ACCESS,
      });
      if (!tokenDoc || tokenDoc.isBlacklist) throw new ApiException(`invalid token`);
      return payload;
    } catch (error) {
      throw new ApiException(error.message, HttpStatus.UNAUTHORIZED, `${TokenService.name}/${this.verify.name}`);
    }
  }

  decode(token: string): jwt.JwtPayload | string {
    return jwt.decode(token);
  }
  save(data: SaveTokenPayload): Promise<TokenEntity> {
    return this.tokenModel.create(data);
  }
  async revoke(user: string): Promise<void> {
    await this.tokenModel.updateMany(
      {
        user,
      },
      { isBlacklist: true },
    );
    return;
  }
  async findTokenConfirm(token: string): Promise<TokenEntity> {
    return this.tokenModel.findOne({ token, type: TOKEN_TYPE.CONFIRM });
  }
  async findRefreshToken(token: string): Promise<TokenEntity> {
    return this.tokenModel.findOne({ token, type: TOKEN_TYPE.REFRESH });
  }
  async findTokenJoinRoom(token: string): Promise<TokenEntity> {
    return this.tokenModel.findOne({ token, type: TOKEN_TYPE.JOIN_ROOM });
  }
}
