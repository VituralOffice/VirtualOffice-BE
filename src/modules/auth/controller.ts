import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwaggerResponse } from './swagger';
import { LoginDto, RefreshTokenDto, VerifyEmailDto } from './dto';
import { Request, Response } from 'express';
import { JWT_ACCESS_KEY, JWT_REFRESH_KEY } from 'src/constant';
import { Public } from 'src/common/decorators/public.decorator';
import { UserEntity } from '../user/entity';
import { ApiFailedRes } from 'src/common/documentation/swagger';
import { User } from 'src/common/decorators/current-user.decorator';
import { AuthService } from './service';

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
      domain: req.originalUrl,
    });
    res.cookie(JWT_REFRESH_KEY, refreshToken, {
      httpOnly: false,
      secure: true,
      path: '/',
      domain: req.originalUrl,
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
  async logout(@User() user: UserEntity, @Res() res: Response) {
    await this.authService.logout(user);
    res.clearCookie(`accessToken`);
    res.clearCookie(`refreshToken`);
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
    const { accessToken, refreshToken } = await this.authService.refreshToken(body.refreshToken);
    res.cookie(JWT_ACCESS_KEY, accessToken, {
      httpOnly: false,
      secure: true,
      path: '/',
      domain: req.originalUrl,
    });
    res.cookie(JWT_REFRESH_KEY, refreshToken, {
      httpOnly: false,
      secure: true,
      path: '/',
      domain: req.originalUrl,
    });
    return res.status(200).json({
      result: {
        accessToken,
        refreshToken,
      },
      message: `Success`,
      code: 200,
    });
  }
}
