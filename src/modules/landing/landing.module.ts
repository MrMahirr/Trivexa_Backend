import { Module } from '@nestjs/common';
import { EmailModule } from '../../shared/email/email.module';
import { ClientsModule } from '../clients/clients.module';
import { UsersModule } from '../users/users.module';
import { LandingController } from './api/landing.controller';
import { LandingService } from './application/landing.service';
import { LandingContactRequestsRepository } from './infrastructure/landing-contact-requests.repository';

@Module({
  imports: [EmailModule, ClientsModule, UsersModule],
  controllers: [LandingController],
  providers: [LandingService, LandingContactRequestsRepository],
  exports: [LandingService],
})
export class LandingModule {}
