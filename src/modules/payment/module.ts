import { Module } from '@nestjs/common';
import { SecretsModule } from '../global/secrets/module';
import { paymentProviders } from './providers';
import { PaymentController } from './controller';
import { PlanModule } from '../plan/module';

@Module({
  imports: [SecretsModule, PlanModule],
  providers: [...paymentProviders],
  controllers: [PaymentController],
  exports: [...paymentProviders],
})
export class PaymentModule {}
