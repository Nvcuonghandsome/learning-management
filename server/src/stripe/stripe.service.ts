import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  constructor(
    @Inject('STRIPE_CLIENT')
    private readonly stripeClient: Stripe,
  ) {}

  async createPaymentIntent(amount: number) {
    try {
      if (!amount || amount <= 0) {
        amount = 50; // Stripe validate min amount is 50 cents
      }

      const paymentIntent = await this.stripeClient.paymentIntents.create({
        amount,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      return {
        message: 'Create payment intent successfully!',
        data: {
          clientSecret: paymentIntent.client_secret,
        },
      };
    } catch (error) {
      console.error('Error create payment intent', error);
      return {
        message: 'Create payment intent failed!',
      };
    }
  }
}
