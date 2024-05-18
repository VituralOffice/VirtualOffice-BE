import { Module } from '@nestjs/common';
import { RoomModule } from '../rooms/module';
import { UserModule } from '../user/module';
import { MapModule } from '../map/module';
import { DatabaseModule } from '../database/module';
import { AdminController } from './controller';

@Module({
  imports: [RoomModule, UserModule, MapModule, DatabaseModule],
  controllers: [AdminController],
})
export class AdminModule {}
