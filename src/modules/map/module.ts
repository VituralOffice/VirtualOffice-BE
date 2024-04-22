import { Module } from '@nestjs/common';
import { MapController } from './controller';
import { mapProviders } from './provider';
import { DatabaseModule } from '../database/module';

@Module({
  imports: [DatabaseModule],
  controllers: [MapController],
  providers: [...mapProviders],
  exports: [...mapProviders],
})
export class MapModule {}
