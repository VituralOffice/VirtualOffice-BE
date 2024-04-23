import { Module } from '@nestjs/common';
import { RoomController } from './controller';
import { roomProviders } from './providers';
import { DatabaseModule } from '../database/module';
import { TokenModule } from '../token/module';
import { RedisModule } from '../cache/module';
import { SecretsModule } from '../global/secrets/module';

@Module({
  imports: [DatabaseModule, TokenModule, RedisModule, SecretsModule],
  controllers: [RoomController],
  providers: [...roomProviders],
  exports: [...roomProviders],
})
export class RoomModule {}
