import { Module } from '@nestjs/common';
import { TokenModule } from 'src/modules/token/module';

import { UserModule } from '../user/module';
import { IAuthService } from './adapter';
import { AuthController } from './controller';
import { AuthService } from './service';
import { ITokenService } from '../token/adapter';
import { ISecretsService } from '../global/secrets/adapter';

@Module({
  imports: [TokenModule, UserModule],
  controllers: [AuthController],
  providers: [
    {
      provide: IAuthService,
      useClass: AuthService,
    },
  ],
  exports: [IAuthService],
})
export class AuthModule {}
