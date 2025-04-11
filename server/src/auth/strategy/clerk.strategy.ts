import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-http-bearer';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import { ClerkService } from 'src/clerk/clerk.service';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  constructor(
    private config: ConfigService,
    private clerk: ClerkService,
  ) {
    super();
  }

  async validate(token: string): Promise<any> {
    try {
      const clerkSecretKey = this.config.get('CLERK_SECRET_KEY');
      const payload = await verifyToken(token, { secretKey: clerkSecretKey });
      // console.log('payload', payload);

      const user = await this.clerk.users.getUser(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (err) {
      console.error('Clerk token validation error:', err);
      throw new UnauthorizedException('Invalid Clerk token');
    }
  }
}
