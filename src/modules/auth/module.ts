import { Module } from '@nestjs/common';
import { TokenModule } from 'src/modules/token/module';

import { UserModule } from '../user/module';
import { IAuthService } from './adapter';
import { AuthController } from './controller';
import { AuthService } from './service';
import { JwtAuthModule } from './jwt/jwt.module';
import { SecretsModule } from '../global/secrets/module';
import { GoogleOauthModule } from './google/google-oauth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { RedisModule } from '../cache/module';

@Module({
  imports: [TokenModule, UserModule, JwtAuthModule, SecretsModule, GoogleOauthModule, RedisModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
