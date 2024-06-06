import { Module } from '@nestjs/common';
import { GoogleOauthController } from './google-oauth.controller';
import { GoogleOauthStrategy } from './google-oauth.strategy';
import { UserModule } from 'src/modules/user/module';
import { JwtAuthModule } from '../jwt/jwt.module';
import { TokenModule } from 'src/modules/token/module';
import { PlanModule } from 'src/modules/plan/module';
import { CharacterModule } from 'src/modules/character/module';
import { SubscriptionModule } from 'src/modules/subcription/module';

@Module({
  imports: [UserModule, JwtAuthModule, TokenModule, PlanModule, CharacterModule, SubscriptionModule],
  controllers: [GoogleOauthController],
  providers: [GoogleOauthStrategy],
})
export class GoogleOauthModule {}
