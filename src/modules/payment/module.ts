import { Module } from '@nestjs/common';
import { SecretsModule } from '../global/secrets/module';
import { paymentProviders } from './providers';
import { PaymentController } from './controller';
import { PlanModule } from '../plan/module';
import { SubscriptionModule } from '../subcription/module';

@Module({
  imports: [SecretsModule, PlanModule, SubscriptionModule],
  providers: [...paymentProviders],
  controllers: [PaymentController],
  exports: [...paymentProviders],
})
export class PaymentModule {}
