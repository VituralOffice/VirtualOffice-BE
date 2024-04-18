import { Module } from '@nestjs/common';
import { UserController } from './controller';
import { CharacterModule } from '../character/module';
import { userProviders } from './provider';
import { DatabaseModule } from '../database/module';

@Module({
  imports: [DatabaseModule, CharacterModule],
  controllers: [UserController],
  providers: [...userProviders],
  exports: [...userProviders],
})
export class UserModule {}
