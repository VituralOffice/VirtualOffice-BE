import { Module } from '@nestjs/common';
import { SecretsModule } from '../global/secrets/module';
import { paymentProviders } from './providers';
import { PaymentController } from './controller';
import { PlanModule } from '../plan/module';
import { SubscriptionModule } from '../subcription/module';
import { RoomModule } from '../rooms/module';

@Module({
  imports: [SecretsModule, PlanModule, SubscriptionModule, RoomModule],
  providers: [...paymentProviders],
  controllers: [PaymentController],
  exports: [...paymentProviders],
})
export class PaymentModule {}
