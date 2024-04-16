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
import { AuthGuard } from './auth.guard';

@Module({
  imports: [TokenModule, UserModule, JwtAuthModule, SecretsModule, GoogleOauthModule],
  controllers: [AuthController],
  providers: [
    {
      provide: IAuthService,
      useClass: AuthService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [IAuthService],
})
export class AuthModule {}
