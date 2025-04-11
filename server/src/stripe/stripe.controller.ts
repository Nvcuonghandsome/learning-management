import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dto/stripe.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('clerk'))
@Controller('transactions')
export class StripeController {
  constructor(private stripe: StripeService) {}

  @Post('/payment-intent')
  createPaymentIntent(@Body() body: CreatePaymentIntentDto) {
    return this.stripe.createPaymentIntent(body.amount);
  }
}
