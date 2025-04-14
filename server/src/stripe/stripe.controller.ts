import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto, CreateTransactionDto } from './dto/stripe.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('clerk'))
@Controller('transactions')
export class StripeController {
  constructor(private stripe: StripeService) {}

  @Post('/payment-intent')
  createPaymentIntent(@Body() body: CreatePaymentIntentDto) {
    return this.stripe.createPaymentIntent(body.amount);
  }

  @Post('/create-transaction')
  createTransaction(@Body() body: CreateTransactionDto) {
    return this.stripe.createTransaction(
      body.transactionId,
      body.userId,
      body.courseId,
      body.amount,
      body.paymentProvider,
    );
  }

  @Get('/list')
  listTransactions(@Query('userId') userId: string) {
    return this.stripe.listTransactions(userId);
  }
}
