import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISecretsService } from 'src/modules/global/secrets/adapter';
import { Request } from 'express';

export type JwtPayload = { userId: string; email: string };
const cookieExtractor = (req: Request) => {
  let token = null;
  if (req && req.cookies) token = req.cookies['jwt'];
  return token;
};
@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(secretsService: ISecretsService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: secretsService.jwt.accessSecret,
    });
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.userId, email: payload.email };
  }
}
