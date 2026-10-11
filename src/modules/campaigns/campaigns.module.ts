import { Module } from '@nestjs/common';
import { CampaignsController } from './api/campaigns.controller';
import { CampaignsService } from './application/campaigns.service';
import { CampaignsRepository } from './infrastructure/campaigns.repository';

@Module({
  controllers: [CampaignsController],
  providers: [CampaignsService, CampaignsRepository],
  exports: [CampaignsService],
})
export class CampaignsModule {}
