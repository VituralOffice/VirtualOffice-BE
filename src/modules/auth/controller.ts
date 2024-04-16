import { Body, Controller, Get, HttpCode, Param, Post, Query, Res } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IAuthService } from './adapter';
import { SwaggerResponse } from './swagger';
import { ConfirmEmailDto, CreateUserDto, LoginDto } from './dto';
import { Response } from 'express';
import { JWT_ACCESS_KEY, JWT_REFRESH_KEY } from 'src/constant';
import { Public } from 'src/common/decorators/public.decorator';

@Controller({
  path: 'auth',
})
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiBody({ type: LoginDto })
  @ApiResponse(SwaggerResponse.login[200])
  @ApiResponse(SwaggerResponse.login[412])
  @Public()
  async login(@Body() payload: LoginDto, @Res() res: Response): Promise<unknown> {
    const user = await this.authService.login(payload);
    const { accessToken, refreshToken } = await this.authService.signPairToken(user);
    res.cookie(JWT_ACCESS_KEY, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      path: '/',
    });
    res.cookie(JWT_REFRESH_KEY, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      path: '/',
    });
    return res.status(200).json({
      result: user,
      message: `Success`,
      code: 200,
    });
  }
  @Post('register')
  @HttpCode(200)
  @ApiBody({ type: CreateUserDto })
  @Public()
  async register(@Body() payload: CreateUserDto, @Res() res: Response): Promise<unknown> {
    const user = await this.authService.register(payload);
    await this.authService.sendConfirmLink(user);
    const { accessToken, refreshToken } = await this.authService.signPairToken(user);
    res.cookie(JWT_ACCESS_KEY, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      path: '/',
    });
    res.cookie(JWT_REFRESH_KEY, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      path: '/',
    });
    return res.status(200).json({
      result: user,
      message: `Success`,
      code: 200,
    });
  }

  @Post('confirm')
  @Public()
  @ApiBody({ type: ConfirmEmailDto })
  async confirmEmail(@Body() body: ConfirmEmailDto) {
    const user = await this.authService.verifyEmail(body.token)
    return {
      result: user,
      message: `Success`
    }
  }
}
