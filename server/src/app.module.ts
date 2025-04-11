import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CourseModule } from './course/course.module';
import { ClerkModule } from './clerk/clerk.module';

@Module({
  imports: [
    // can use config env global
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PrismaModule,
    CourseModule,
    ClerkModule,
  ],
})
export class AppModule {}
