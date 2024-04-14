import { Module } from '@nestjs/common';
import { AuthDatabaseModule } from './database/connection/auth';
import { TokenModule } from './token/module';
import { LoggerModule } from './global/logger/module';
import { GlobalModule } from './global/module';

import { HealthModule } from './health/module';
import { AuthModule } from './auth/module';
import { UserModule } from './user/module';

@Module({
  imports: [HealthModule, GlobalModule, AuthDatabaseModule, TokenModule, AuthModule, UserModule, LoggerModule],
})
export class MainModule {}
