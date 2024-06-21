import { Body, Controller, Get, Logger, Param, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from './service';
import { BILLING_CYCLE, CancelDto, CreateCheckoutDto, RetryCheckoutDto } from './dto';
import { PlanService } from '../plan/service';
import { ApiException } from 'src/common';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../user/entity';
import { SubscriptionService } from '../subcription/service';
import { addDateUnit } from 'src/common/helpers/common';
import { PAYMENT_STATUS, SUBSCRIPTION_STATUS } from '../subcription/constant';
import { ISecretsService } from '../global/secrets/adapter';
import { Request, Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('payments')
@Controller({
  path: `payments`,
})
export class PaymentController {
  logger = new Logger(PaymentController.name);
  constructor(
    private readonly paymentService: PaymentService,
    private readonly planService: PlanService,
    private readonly subscriptionService: SubscriptionService,
    private readonly secretsService: ISecretsService,
  ) {}
  @Get('stripe_customer_portal')
  getCustomerPortal() {
    return {
      result: this.secretsService.STRIPE_CUSTOMER_PORTAL,
      message: `Success`,
    };
  }
  @Public()
  @Post('stripe_webhook')
  async stripeWebhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    try {
      const event = await this.paymentService.constructEvent(req.body, sig);
      this.logger.log(`[event.type]: ${event.type}`);
      this.logger.log(`[event.data.object]: ${JSON.stringify(event.data.object)}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.paymentService.handleCheckoutSessionCompleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.paymentService.handleInvoicePaymentSucceeded(event.data.object);
          break;
        case `invoice.upcoming`:
          await this.paymentService.handleInvoiceUpcoming(event.data.object);
          break;
        case `invoice.payment_action_required`:
          await this.paymentService.handleInvoicePaymentActionRequire(event.data.object);
          break;
        case `invoice.payment_failed`:
          await this.paymentService.handleInvoiceUpcoming(event.data.object);
          break;
        case 'customer.subscription.created':
          await this.paymentService.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.paymentService.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.paymentService.handleSubscriptionDeleted(event.data.object);
          break;
        case 'customer.subscription.paused':
          await this.paymentService.handleSubscriptionPaused(event.data.object);
          break;
        case 'customer.subscription.resumed':
          await this.paymentService.handleSubscriptionResumed(event.data.object);
          break;
        default:
          this.logger.log(`Unhandled event type ${event.type}`);
      }
      // Return a 200 response to acknowledge receipt of the event
      return res.status(200).send();
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
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
    // save stripe session id for webhook event
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
    const subscription = await this.subscriptionService.findUserSubscription(body.subscriptionId, user);
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
  @Post('cancel')
  async cancel(@Body() body: CancelDto, @User() user: UserEntity) {
    const subscription = await this.subscriptionService.findUserSubscription(body.subscriptionId, user);
    if (!subscription) throw new ApiException(`subscription not found`, 400);
    subscription.status = SUBSCRIPTION_STATUS.CANCELLED;
    await subscription.save();
    //todo: inactive rooms
    await this.paymentService.cancelStripeSubscription(subscription.stripeSubscriptionId);
    return {
      result: null,
      message: `Success`,
    };
  }
}
