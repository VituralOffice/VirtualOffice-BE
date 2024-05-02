import { Module } from '@nestjs/common';
import { planProviders } from './providers';
import { PlanController } from './controller';
import { DatabaseModule } from '../database/module';

@Module({
  imports: [DatabaseModule],
  providers: [...planProviders],
  controllers: [PlanController],
  exports: [...planProviders],
})
export class PlanModule {}
