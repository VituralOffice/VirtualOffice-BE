import * as path from 'path';
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
import { CharacterModule } from './character/module';
import { ChatModule } from './chat/module';
import { MapModule } from './map/module';
import { RoomModule } from './rooms/module';
import { PlanModule } from './plan/module';
import { PaymentModule } from './payment/module';

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
    CharacterModule,
    ChatModule,
    MapModule,
    RoomModule,
    PlanModule,
    PaymentModule,
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
          dir: path.join(__dirname, '/email/templates/'), //process.cwd() + '/dist/modules/email/templates/',
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
