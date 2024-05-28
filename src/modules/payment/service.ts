import { Injectable } from '@nestjs/common';
import { ISecretsService } from '../global/secrets/adapter';
import Stripe from 'stripe';
import { UserEntity } from '../user/entity';
@Injectable()
export class PaymentService {
  private stripe: Stripe;
  constructor(private readonly secretsService: ISecretsService) {
    this.stripe = new Stripe(this.secretsService.STRIPE_PRIVATE_KEY);
  }
  async createCheckoutSession(user: UserEntity, priceId: string, subscriptionId: string) {
    console.log(`${this.secretsService.API_URL}/v1/payments/subscriptions/${subscriptionId}/success`);
    const session = await this.stripe.checkout.sessions.create({
      success_url: `${this.secretsService.API_URL}/v1/payments/subscriptions/${subscriptionId}/success`,
      cancel_url: `${this.secretsService.API_URL}/v1/payments/subscriptions/${subscriptionId}/cancel`,
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
  async sendInvoice(invoiceId: string) {
    return this.stripe.invoices.sendInvoice(invoiceId);
  }
}
