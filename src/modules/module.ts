import { Global, Module } from '@nestjs/common';
import { AuthDatabaseModule } from './database/connection/auth';
import { TokenModule } from './token/module';
import { LoggerModule } from './global/logger/module';
import { GlobalModule } from './global/module';

import { HealthModule } from './health/module';
import { AuthModule } from './auth/module';
import { UserModule } from './user/module';
import { AWSModule } from './aws/module';
import { UploadModule } from './upload/module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ISecretsService } from './global/secrets/adapter';
@Global()
@Module({
  imports: [
    HealthModule,
    GlobalModule,
    AuthDatabaseModule,
    TokenModule,
    AuthModule,
    UserModule,
    AWSModule,
    UploadModule,
    LoggerModule,
    MailerModule.forRootAsync({
      useFactory: (secretsService: ISecretsService) => ({
        transport: {
          host: secretsService.smtp.host,
          port: secretsService.smtp.port,
          name: `VOffice`,
          auth: {
            user: secretsService.smtp.auth.user,
            pass: secretsService.smtp.auth.pass,
          },
        },
        preview: true,
        template: {
          dir: process.cwd() + '/src/modules/email/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ISecretsService],
    }),
  ],
})
export class MainModule {}
