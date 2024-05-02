import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from './service';
import { BILLING_CYCLE, CreateCheckoutDto } from './dto';
import { PlanService } from '../plan/service';
import { ApiException } from 'src/common';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../user/entity';
import { UserService } from '../user/service';
import { SubscriptionService } from '../subcription/service';

@ApiTags('payments')
@Controller({
  path: `payments`,
})
export class PaymentController {
  constructor(private readonly paymentService: PaymentService, private readonly planService: PlanService) {}

  @Post('checkout')
  async createCheckoutSession(@Body() body: CreateCheckoutDto, @User() user: UserEntity) {
    const plan = await this.planService.findById(body.planId);
    if (!plan) throw new ApiException(`plan not found`, 404);
    // check if exist subscriptions
    //const existSubscription = await this.subscriptionService.findOne();
    //if (existSubscription) throw new ApiException(`user already have this plan`, 400);
    let priceId: string;
    if (body.billingCycle === BILLING_CYCLE.MONTH) priceId = plan.monthlyPriceId;
    else priceId = plan.annuallyPriceId;
    const session = await this.paymentService.createCheckoutSession(priceId);
    return {
      result: session,
      message: `Success`,
    };
  }
}
