import { Body, Controller, Get, HttpCode, Param, Post, Query, Res } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags, ApiBadRequestResponse, refs } from '@nestjs/swagger';
import { IAuthService } from './adapter';
import { SwaggerResponse } from './swagger';
import { LoginDto, VerifyEmailDto } from './dto';
import { Request, Response } from 'express';
import { JWT_ACCESS_KEY, JWT_REFRESH_KEY } from 'src/constant';
import { Public } from 'src/common/decorators/public.decorator';
import { UserEntity } from '../user/entity';
import { ExceedIncorrectOtpTryException, OtpExpiredException, UserNotFoundException } from './exception';
import { ApiFailedRes } from 'src/common/documentation/swagger';

@Controller({
  path: 'auth',
})
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: IAuthService) {}
  @Post('login')
  @HttpCode(200)
  @ApiBody({ type: LoginDto })
  @Public()
  async login(@Body() payload: LoginDto, @Res() res: Response): Promise<unknown> {
    const user = await this.authService.login(payload);
    const otp = await this.authService.genOtp(user)
    await this.authService.sendOtp({
      otp,
      email: user.email
    })
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
  async confirmEmail(@Body() body: VerifyEmailDto, @Res() res: Response) {
    const user = await this.authService.verifyOtp(body);
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
}
