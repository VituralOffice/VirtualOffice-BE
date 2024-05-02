import { Injectable } from '@nestjs/common';
import { ISecretsService } from '../global/secrets/adapter';
import Stripe from 'stripe';
@Injectable()
export class PaymentService {
  private stripe: Stripe;
  constructor(private readonly secretsService: ISecretsService) {
    this.stripe = new Stripe(this.secretsService.STRIPE_PRIVATE_KEY);
  }
  async createCheckoutSession(priceId: string) {
    const session = await this.stripe.checkout.sessions.create({
      success_url: `${this.secretsService.STRIPE_SUCCESS_CALLBACK}`,
      cancel_url: `${this.secretsService.STRIPE_CANCEL_CALLBACK}`,
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
