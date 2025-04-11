import { ClerkClient, createClerkClient } from '@clerk/clerk-sdk-node';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkService {
  private client: ClerkClient;

  constructor(private config: ConfigService) {
    this.client = createClerkClient({
      secretKey: config.get('CLERK_SECRET_KEY'),
    });
  }

  get users() {
    return this.client.users;
  }
}
