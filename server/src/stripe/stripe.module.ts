import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';

@Module({
  imports: [ConfigModule],
  providers: [
    StripeService,
    {
      provide: 'STRIPE_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get('STRIPE_SECRET_KEY')!, {
          apiVersion: '2025-03-31.basil',
        });
      },
    },
  ],
  exports: [StripeService],
  controllers: [StripeController],
})
export class StripeModule {}
