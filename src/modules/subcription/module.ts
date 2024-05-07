import { Module } from '@nestjs/common';
import { SubscriptionController } from './controller';
import { subscriptionProviders } from './providers';
import { DatabaseModule } from '../database/module';

@Module({
  imports: [DatabaseModule],
  providers: [...subscriptionProviders],
  controllers: [SubscriptionController],
  exports: [...subscriptionProviders],
})
export class SubscriptionModule {}
