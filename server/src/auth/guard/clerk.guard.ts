import { AuthGuard } from '@nestjs/passport';

export class ClerkGuard extends AuthGuard('clerk') {}
