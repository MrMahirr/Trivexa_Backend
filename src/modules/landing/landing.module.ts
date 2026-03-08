import { Module } from '@nestjs/common';
import { EmailModule } from '../../shared/email/email.module';
import { LandingController } from './api/landing.controller';
import { LandingService } from './application/landing.service';

@Module({
  imports: [EmailModule],
  controllers: [LandingController],
  providers: [LandingService],
  exports: [LandingService],
})
export class LandingModule {}
