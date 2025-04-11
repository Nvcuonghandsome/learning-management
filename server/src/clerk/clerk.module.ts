import { Module, Global } from '@nestjs/common';
import { ClerkService } from './clerk.service';

@Global() // make clerk service global
@Module({
  providers: [ClerkService],
  exports: [ClerkService],
})
export class ClerkModule {}
