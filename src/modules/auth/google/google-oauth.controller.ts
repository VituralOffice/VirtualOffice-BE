import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { GoogleOauthGuard } from './google-oauth.guard';
import { TokenService } from 'src/modules/token/service';
import { ISecretsService } from 'src/modules/global/secrets/adapter';
import { UserEntity } from 'src/modules/user/entity';
import { JwtPayload } from '../jwt/jwt.strategy';
import { TOKEN_TYPE } from 'src/modules/token/enum';
import { JWT_ACCESS_KEY, JWT_REFRESH_KEY } from 'src/constant';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('')
@Controller('auth')
export class GoogleOauthController {
  constructor(private tokenService: TokenService, private readonly secretsService: ISecretsService) {}
  @Get('google')
  @Public()
  @UseGuards(GoogleOauthGuard)
  async googleAuth() {}

  @Get('/google/redirect')
  @Public()
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as UserEntity;
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    };
    await this.tokenService.revoke(user.id);
    const accessToken = this.tokenService.sign(payload, this.secretsService.jwt.accessSecret, {
      algorithm: 'HS256',
      expiresIn: this.secretsService.jwt.accessExpires,
    });
    const refreshToken = this.tokenService.sign(payload, this.secretsService.jwt.refreshSecret, {
      algorithm: 'HS256',
      expiresIn: this.secretsService.jwt.refreshExpires,
    });
    await this.tokenService.save({ token: accessToken, type: TOKEN_TYPE.ACCESS, user });
    await this.tokenService.save({ token: refreshToken, type: TOKEN_TYPE.REFRESH, user });
    res.cookie(JWT_ACCESS_KEY, accessToken, {
      httpOnly: false,
      secure: true,
      sameSite: true,
      path: '/',
    });
    res.cookie(JWT_REFRESH_KEY, refreshToken, {
      httpOnly: false,
      secure: true,
      sameSite: true,
      path: '/',
    });
    const appRoute = `${this.secretsService.APP_URL}/app`;
    return res.redirect(appRoute);
  }
}
