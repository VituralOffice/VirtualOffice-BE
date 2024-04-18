import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, JWT_ACCESS_KEY } from 'src/constant';
import { TokenService } from '../../token/service';
import { ISecretsService } from '../../global/secrets/adapter';
import { Request } from 'express';
import { UserService } from '../../user/service';
import { JwtPayload } from '../jwt/jwt.strategy';
import { ApiException } from 'src/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private secretsService: ISecretsService,
    private userService: UserService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = this.tokenService.verify(token, this.secretsService.jwt.accessSecret);
      const user = await this.userService.findById(payload.userId);
      if (!user) throw new ApiException(`User not found`, 404);
      request['user'] = user;
    } catch (error) {
      if ((error.message = `jwt expired`)) throw new ApiException(`token expired`, 401);
      throw new UnauthorizedException();
    }
    return true;
  }
  private extractTokenFromCookie(request: Request): string | undefined {
    let { authorization } = request.headers;
    return authorization?.split(' ')[1];
  }
}
