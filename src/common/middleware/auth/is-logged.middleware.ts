import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ILoggerService } from 'src/modules/global/logger/adapter';
import { ISecretsService } from 'src/modules/global/secrets/adapter';
import { TokenService } from 'src/modules/token/service';

import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class IsLoggedMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenService: TokenService,
    private readonly loggerService: ILoggerService,
    private readonly secretsService: ISecretsService,
  ) {}
  async use(request: Request, response: Response, next: NextFunction): Promise<void> {
    const tokenHeader = request.headers.authorization;

    if (!tokenHeader) {
      if (!request.headers?.traceid) {
        request.headers.traceid = uuidv4();
      }
      response.status(412);
      this.loggerService.pino(request, response);
      throw new UnauthorizedException('no token provided');
    }

    const token = tokenHeader.split(' ')[1];

    const userDecoded = await this.tokenService.verify(token, this.secretsService.jwt.accessSecret);

    request.headers.user = userDecoded.userId;

    next();
  }
}
