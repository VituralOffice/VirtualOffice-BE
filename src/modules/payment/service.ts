import { Injectable } from '@nestjs/common';
import { ISecretsService } from '../global/secrets/adapter';
import Stripe from 'stripe';
import { UserEntity } from '../user/entity';
import { SubscriptionService } from '../subcription/service';
import { PAYMENT_STATUS, SUBSCRIPTION_STATUS } from '../subcription/constant';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../user/schema';
import { Plan } from '../plan/schema';
@Injectable()
export class PaymentService {
  private stripe: Stripe;
  constructor(
    private readonly secretsService: ISecretsService,
    private readonly subscriptionService: SubscriptionService,
    private readonly mailerService: MailerService,
  ) {
    this.stripe = new Stripe(this.secretsService.STRIPE_PRIVATE_KEY);
  }
  async createCheckoutSession(user: UserEntity, priceId: string, subscriptionId: string) {
    const session = await this.stripe.checkout.sessions.create({
      success_url: `${this.secretsService.APP_URL}/user/settings`,
      cancel_url: `${this.secretsService.APP_URL}/user/settings`,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: user.email,
    });
    return session;
  }
  async retrieveSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }
  async retrieveSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }
  async sendInvoice(invoiceId: string) {
    return this.stripe.invoices.sendInvoice(invoiceId);
  }
  async constructEvent(event: Buffer, sig: string) {
    return this.stripe.webhooks.constructEvent(event, sig, this.secretsService.STRIPE_WEBHOOK_SECRET);
  }
  async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const subscription = await this.subscriptionService.findBySessionId(session.id);
    if (session.status === 'complete') {
      subscription.status = SUBSCRIPTION_STATUS.ACTIVE;
      subscription.stripeSubscriptionId = session.subscription.toString();
      subscription.paymentStatus = PAYMENT_STATUS.PAID;
      await subscription.save();
    }
  }
  async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {}
  async handleSubscriptionCreated(subscription: Stripe.Subscription) {}
  async handleSubscriptionUpdated(subscription: Stripe.Subscription) {}
  // several day before renewal day
  async handleInvoiceUpcoming(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription.toString();
    const dbSubscription = await this.subscriptionService.findBySubscriptionId(subscriptionId);
    if (!dbSubscription) return;
    await dbSubscription.populate(['user', 'plan']);
    this.mailerService.sendMail({
      to: (dbSubscription.user as User).email,
      from: `VOffice <${this.secretsService.smtp.from}>`,
      subject: 'Your Subscription is Due for Renewal Soon ',
      template: 'duePayment',
      context: {
        plan: (dbSubscription.plan as Plan).name,
        total: dbSubscription.total,
        date: new Date(dbSubscription.endDate).toDateString(),
      },
    });
  }
  // can't charge for invoice
  async handleInvoicePaymentActionRequire(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription.toString();
    const dbSubscription = await this.subscriptionService.findBySubscriptionId(subscriptionId);
    if (!dbSubscription) return;
    await dbSubscription.populate(['user', 'plan']);
    this.mailerService.sendMail({
      to: (dbSubscription.user as User).email,
      from: `VOffice <${this.secretsService.smtp.from}>`,
      subject: 'Your Subscription Payment is Past Due',
      template: 'pastDuePayment',
      context: {
        plan: (dbSubscription.plan as Plan).name,
        total: dbSubscription.total,
        date: new Date(dbSubscription.endDate).toDateString(),
      },
    });
  }
  // customer not pay for invoice after several time retry
  async handleInvoicePaymentFail(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription.toString();
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    if (subscription.status === 'past_due') {
      await this.stripe.subscriptions.cancel(subscriptionId);
      const dbSubscription = await this.subscriptionService.findBySubscriptionId(subscriptionId);
      if (!dbSubscription) return;
      dbSubscription.status = SUBSCRIPTION_STATUS.EXPIRED;
      dbSubscription.paymentStatus = PAYMENT_STATUS.PAST_DUE;
    }
  }
  // customer delete subscription
  async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const dbSubscription = await this.subscriptionService.findBySubscriptionId(subscription.id);
    if (!dbSubscription) return;
    dbSubscription.status = SUBSCRIPTION_STATUS.CANCELLED;
    // todo inactive rooms
  }
  async cancelStripeSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.cancel(subscriptionId);
  }
  async handleSubscriptionPaused(subscription: Stripe.Subscription) {}
  async handleSubscriptionResumed(subscription: Stripe.Subscription) {}
}
