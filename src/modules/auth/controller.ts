import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IAuthService } from './adapter';
import { SwaggerResponse } from './swagger';
import { CreateUserDto, LoginDto } from './dto';

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
  async login(@Body() payload: LoginDto): Promise<unknown> {
    const user = await this.authService.login(payload);
    const { accessToken, refreshToken } = await this.authService.signPairToken(user);
    return {
      result: {
        user,
        accessToken,
        refreshToken,
      },
      message: `Success`,
    };
  }
  @Post('register')
  @HttpCode(200)
  @ApiBody({ type: CreateUserDto })
  async register(@Body() payload: CreateUserDto): Promise<unknown> {
    const user = await this.authService.register(payload);
    const { accessToken, refreshToken } = await this.authService.signPairToken(user);
    return {
      result: {
        user,
        accessToken,
        refreshToken,
      },
      message: `Success`,
    };
  }
}
