import { Module } from '@nestjs/common';
import { RoomController } from './controller';
import { roomProviders } from './providers';
import { DatabaseModule } from '../database/module';
import { TokenModule } from '../token/module';
import { RedisModule } from '../cache/module';
import { SecretsModule } from '../global/secrets/module';
import { UserModule } from '../user/module';
import { ChatModule } from '../chat/module';
import { SubscriptionModule } from '../subcription/module';
import { PlanModule } from '../plan/module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    TokenModule,
    RedisModule,
    SecretsModule,
    ChatModule,
    SubscriptionModule,
    PlanModule,
  ],
  controllers: [RoomController],
  providers: [...roomProviders],
  exports: [...roomProviders],
})
export class RoomModule {}
