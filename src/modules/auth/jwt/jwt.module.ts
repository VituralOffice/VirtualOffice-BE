import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthStrategy } from './jwt.strategy';
import { ISecretsService } from 'src/modules/global/secrets/adapter';
import { SecretsModule } from 'src/modules/global/secrets/module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory(secretsService: ISecretsService) {
        return {
          secret: secretsService.jwt.accessSecret,
          signOptions: {
            expiresIn: secretsService.jwt.accessExpires,
          },
          global: true,
        };
      },
      inject: [ISecretsService],
      imports: [SecretsModule],
    }),
  ],
  providers: [JwtAuthStrategy],
  exports: [JwtModule],
})
export class JwtAuthModule {}
