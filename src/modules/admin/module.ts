import { Module } from '@nestjs/common';
import { RoomModule } from '../rooms/module';
import { UserModule } from '../user/module';
import { MapModule } from '../map/module';
import { DatabaseModule } from '../database/module';
import { AdminController } from './controller';
import { SubscriptionModule } from '../subcription/module';

@Module({
  imports: [RoomModule, UserModule, MapModule, SubscriptionModule, DatabaseModule],
  controllers: [AdminController],
})
export class AdminModule {}
