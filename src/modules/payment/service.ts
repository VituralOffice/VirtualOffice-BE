import { Injectable } from '@nestjs/common';
import { ISecretsService } from '../global/secrets/adapter';
import Stripe from 'stripe';
@Injectable()
export class PaymentService {
  private stripe: Stripe;
  constructor(private readonly secretsService: ISecretsService) {
    this.stripe = new Stripe(this.secretsService.STRIPE_PRIVATE_KEY);
  }
  async createCheckoutSession(priceId: string, subscriptionId: string) {
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
    });
    return session;
  }
  async retrieveSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }
}
