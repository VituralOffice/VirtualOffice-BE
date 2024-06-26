import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwaggerResponse } from './swagger';
import { LoginDto, RefreshTokenDto, VerifyEmailDto } from './dto';
import { CookieOptions, Request, Response } from 'express';
import { JWT_ACCESS_KEY, JWT_REFRESH_KEY } from 'src/constant';
import { Public } from 'src/common/decorators/public.decorator';
import { UserEntity } from '../user/entity';
import { ApiFailedRes } from 'src/common/documentation/swagger';
import { User } from 'src/common/decorators/current-user.decorator';
import { AuthService } from './service';
import { cookieDomain } from 'src/common/helpers/common';
import { ApiException } from 'src/common';

@Controller({
  path: 'auth',
})
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @HttpCode(200)
  @ApiBody({ type: LoginDto })
  @Public()
  async login(@Body() payload: LoginDto, @Res() res: Response): Promise<unknown> {
    const user = await this.authService.login(payload);
    const otp = await this.authService.genOtp(user);
    await this.authService.sendOtp({
      otp,
      email: user.email,
    });
    return res.status(200).json({
      result: user,
      message: `Success`,
      code: 200,
    });
  }
  @Post('verify')
  @Public()
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse(SwaggerResponse.verify[200])
  @ApiFailedRes(...SwaggerResponse.verify[400])
  async confirmEmail(@Body() body: VerifyEmailDto, @Req() req: Request, @Res() res: Response) {
    const user = await this.authService.verifyOtp(body);
    const { accessToken, refreshToken } = await this.authService.signPairToken(user);
    res.cookie(JWT_ACCESS_KEY, accessToken, {
      httpOnly: false,
      secure: true,
      path: '/',
      sameSite: 'none',
      domain: cookieDomain(req.hostname),
    });
    res.cookie(JWT_REFRESH_KEY, refreshToken, {
      httpOnly: false,
      secure: true,
      path: '/',
      sameSite: 'none',
      domain: cookieDomain(req.hostname),
    });
    return res.status(200).json({
      result: {
        accessToken,
        refreshToken,
        user,
      },
      message: `Success`,
      code: 200,
    });
  }
  @Post('logout')
  async logout(@User() user: UserEntity, @Req() req: Request, @Res() res: Response) {
    await this.authService.logout(user);
    res.clearCookie(`accessToken`, {
      httpOnly: false,
      secure: true,
      path: '/',
      sameSite: 'none',
      domain: cookieDomain(req.hostname),
    });
    res.clearCookie(`refreshToken`, {
      httpOnly: false,
      secure: true,
      path: '/',
      sameSite: 'none',
      domain: cookieDomain(req.hostname),
    });
    res.status(200).send({
      result: null,
      message: `Success`,
    });
  }
  @Post('refresh')
  @Public()
  @ApiBody({
    type: RefreshTokenDto,
  })
  async refresh(@Body() body: RefreshTokenDto, @Req() req: Request, @Res() res: Response) {
    const token = await this.authService.refreshToken(body.refreshToken);
    const cookieOpt = {
      httpOnly: false,
      secure: true,
      path: '/',
      sameSite: 'none',
      domain: cookieDomain(req.hostname),
    } as CookieOptions;
    if (!token) {
      res.clearCookie(JWT_ACCESS_KEY, cookieOpt);
      res.clearCookie(JWT_REFRESH_KEY, cookieOpt);
      throw new ApiException(`Invalid refresh token`);
    }
    res.clearCookie(JWT_ACCESS_KEY, cookieOpt);
    res.clearCookie(JWT_REFRESH_KEY, cookieOpt);
    res.cookie(JWT_ACCESS_KEY, token.accessToken, cookieOpt);
    res.cookie(JWT_REFRESH_KEY, token.refreshToken, cookieOpt);
    return res.status(200).json({
      result: token,
      message: `Success`,
      code: 200,
    });
  }
}
