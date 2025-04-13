import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  constructor(
    @Inject('STRIPE_CLIENT')
    private readonly stripeClient: Stripe,
    private prisma: PrismaService,
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

  async createTransaction(
    transactionId: string,
    userId: string,
    courseId: string,
    amount: number,
    paymentProvider: 'stripe',
  ) {
    try {
      const course = await this.prisma.course.findUnique({
        where: { courseId: courseId },
        include: {
          sections: {
            include: {
              chapters: true,
            },
          },
        },
      });

      const newTransaction = await this.prisma.transaction.create({
        data: {
          transactionId,
          amount,
          courseId,
          userId,
          paymentProvider,
          dateTime: new Date().toISOString(),
        },
      });

      const initialUserCourseProgress =
        await this.prisma.userCourseProgress.create({
          data: {
            userId,
            courseId,
            enrollmentDate: new Date().toISOString(),
            overallProgress: 0,
            lastAccessedTimestamp: new Date().toISOString(),
          },
        });

      course?.sections.map(async (section) => {
        const initialSectionProgress = await this.prisma.sectionProgress.create(
          {
            data: {
              sectionId: section.sectionId,
              userCourseProgressId: initialUserCourseProgress.id,
            },
          },
        );

        section.chapters.map(async (chapter) => {
          await this.prisma.chapterProgress.create({
            data: {
              sectionProgressId: initialSectionProgress.id,
              completed: false,
              chapterId: chapter.chapterId,
            },
          });
        });
      });

      return {
        message: 'Purchase course successfully!',
        data: {
          transaction: newTransaction,
          courseProgress: initialUserCourseProgress,
        },
      };
    } catch (error) {
      console.error('Error create transaction', error);
      return {
        message: 'Create transaction failed!',
        error: error,
      };
    }
  }
}
