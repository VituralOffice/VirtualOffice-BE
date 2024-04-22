import { Module } from '@nestjs/common';
import { RoomController } from './controller';
import { roomProviders } from './providers';
import { DatabaseModule } from '../database/module';

@Module({
  imports: [DatabaseModule],
  controllers: [RoomController],
  providers: [...roomProviders],
  exports: [...roomProviders],
})
export class RoomModule {}
