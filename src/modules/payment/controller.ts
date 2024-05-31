import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from './service';
import { BILLING_CYCLE, CreateCheckoutDto, RetryCheckoutDto } from './dto';
import { PlanService } from '../plan/service';
import { ApiException } from 'src/common';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../user/entity';
import { SubscriptionService } from '../subcription/service';
import { addDateUnit } from 'src/common/helpers/common';
import { PAYMENT_STATUS, SUBSCRIPTION_STATUS } from '../subcription/constant';
import { ISecretsService } from '../global/secrets/adapter';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('payments')
@Controller({
  path: `payments`,
})
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly planService: PlanService,
    private readonly subscriptionService: SubscriptionService,
    private readonly secretsService: ISecretsService,
  ) {}
  @Post('checkout')
  async createCheckoutSession(@Body() body: CreateCheckoutDto, @User() user: UserEntity) {
    const plan = await this.planService.findById(body.planId);
    if (!plan) throw new ApiException(`plan not found`, 404);
    // check if exist subscriptions
    const existSubscription = await this.subscriptionService.findActivePlan(body.planId);
    if (existSubscription) throw new ApiException(`user already have this plan`, 400);
    let priceId: string;
    let endDate: Date;
    let total: number;
    let startDate: Date = new Date();
    if (body.billingCycle === BILLING_CYCLE.MONTH) {
      priceId = plan.monthlyPriceId;
      endDate = addDateUnit(startDate, 'month');
      total = plan.monthlyPrice;
    } else {
      priceId = plan.annuallyPriceId;
      endDate = addDateUnit(startDate, 'year');
      total = plan.annuallyPrice;
    }
    const subscription = await this.subscriptionService.create({
      user: user.id,
      plan: body.planId,
      startDate,
      endDate,
      status: SUBSCRIPTION_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING,
      total,
      currency: plan.currency,
      billingCycle: body.billingCycle,
      stripePriceId: priceId,
    });
    const session = await this.paymentService.createCheckoutSession(user, priceId, subscription.id);
    // save stripe session id for payment callback
    subscription.stripeSessionId = session.id;
    await subscription.save();
    return {
      result: {
        checkoutUrl: session.url,
        subscription,
      },
      message: `Success`,
    };
  }
  @Post('checkout_retry')
  async retryCheckout(@Body() body: RetryCheckoutDto, @User() user: UserEntity) {
    const subscription = await this.subscriptionService.findById(body.subscriptionId);
    if (!subscription) throw new ApiException(`subscription not found`, 400);
    if (subscription.status === SUBSCRIPTION_STATUS.ACTIVE)
      throw new ApiException(`subscription has already checkout`, 400);
    // todo: handle more cases
    subscription.status = SUBSCRIPTION_STATUS.PENDING;
    subscription.paymentStatus = PAYMENT_STATUS.PENDING;
    const session = await this.paymentService.createCheckoutSession(user, subscription.stripePriceId, subscription.id);
    // save stripe session id for payment callback
    subscription.stripeSessionId = session.id;
    await subscription.save();
    return {
      result: {
        checkoutUrl: session.url,
        subscription,
      },
      message: `Success`,
    };
  }
  @Public()
  @Get('/subscriptions/:subscriptionId/success')
  async subscriptionCallbackSuccess(@Param('subscriptionId') subscriptionId: string, @Res() res: Response) {
    console.log(`this`);
    const redirectUrl = `${this.secretsService.APP_URL}/user/settings`;
    const subscription = await this.subscriptionService.findById(subscriptionId);
    if (!subscription) return res.redirect(redirectUrl);
    const session = await this.paymentService.retrieveSession(subscription.stripeSessionId);
    console.log({
      session,
    });
    if (!session) return res.redirect(redirectUrl);
    if (session.status === 'complete') {
      subscription.status = SUBSCRIPTION_STATUS.ACTIVE;
      subscription.paymentStatus = PAYMENT_STATUS.PAID;
      subscription.stripeSubscriptionId = session.subscription.toString();
      await subscription.save();
    }
    return res.redirect(redirectUrl);
  }
  @Public()
  @Get('/subscriptions/:subscriptionId/cancel')
  async subscriptionCallbackCancel(@Param('subscriptionId') subscriptionId: string, @Res() res: Response) {
    const redirectUrl = `${this.secretsService.APP_URL}/user/settings`;
    const subscription = await this.subscriptionService.findById(subscriptionId);
    if (!subscription) return res.redirect(redirectUrl);
    subscription.status = SUBSCRIPTION_STATUS.CANCELLED;
    subscription.paymentStatus = PAYMENT_STATUS.FAILED;
    subscription.stripeSubscriptionId = '';
    await subscription.save();
    return res.redirect(redirectUrl);
  }
}
