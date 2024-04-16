import { Module } from '@nestjs/common';
import { GoogleOauthController } from './google-oauth.controller';
import { GoogleOauthStrategy } from './google-oauth.strategy';
import { UserModule } from 'src/modules/user/module';
import { JwtAuthModule } from '../jwt/jwt.module';
import { TokenModule } from 'src/modules/token/module';

@Module({
  imports: [UserModule, JwtAuthModule, TokenModule],
  controllers: [GoogleOauthController],
  providers: [GoogleOauthStrategy],
})
export class GoogleOauthModule {}
