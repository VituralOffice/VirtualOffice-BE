import { Module } from '@nestjs/common';
import { AuthDatabaseModule } from './database/connection/auth';
import { TokenModule } from './token/module';
import { LoggerModule } from './global/logger/module';
import { GlobalModule } from './global/module';

import { HealthModule } from './health/module';
import { AuthModule } from './auth/module';
import { UserModule } from './user/module';
import { AWSModule } from './aws/module';
import { UploadModule } from './upload/module';

@Module({
  imports: [HealthModule, GlobalModule, AuthDatabaseModule, TokenModule, AuthModule, UserModule, AWSModule, UploadModule, LoggerModule],
})
export class MainModule {}
