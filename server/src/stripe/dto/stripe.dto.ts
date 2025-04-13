import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  amount: number;
}

export class CreateTransactionDto {
  @IsString()
  userId: string;

  @IsString()
  courseId: string;

  @IsString()
  transactionId: string;

  @IsNumber()
  amount: number;

  @IsEnum(['stripe'])
  paymentProvider: 'stripe';
}
