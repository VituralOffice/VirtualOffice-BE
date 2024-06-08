import { Module } from '@nestjs/common';
import { RoomModule } from '../rooms/module';
import { UserModule } from '../user/module';
import { MapModule } from '../map/module';
import { DatabaseModule } from '../database/module';
import { AdminController } from './controller';
import { SubscriptionModule } from '../subcription/module';
import { StatsService } from './services/stats';
import { PlanModule } from '../plan/module';

@Module({
  imports: [RoomModule, UserModule, MapModule, SubscriptionModule, DatabaseModule, PlanModule],
  controllers: [AdminController],
  providers: [StatsService],
})
export class AdminModule {}
