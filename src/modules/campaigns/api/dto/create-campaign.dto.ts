import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import {
  CampaignObjective,
  CampaignPlatform,
  CampaignStatus,
} from '../../domain/campaign.entity';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Spring Launch', description: 'Campaign title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ example: 'Instagram reels', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: CampaignPlatform, example: CampaignPlatform.INSTAGRAM })
  @IsEnum(CampaignPlatform)
  platform: CampaignPlatform;

  @ApiProperty({ enum: CampaignObjective, example: CampaignObjective.AWARENESS })
  @IsEnum(CampaignObjective)
  objective: CampaignObjective;

  @ApiProperty({ enum: CampaignStatus, example: CampaignStatus.DRAFT, required: false })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus = CampaignStatus.DRAFT;

  @ApiProperty({ example: '2026-03-01', description: 'Start date (ISO)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-03-31', description: 'End date (ISO)' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 50000, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number = 0;

  @ApiProperty({ example: 'Marketing Team', required: false })
  @IsString()
  @IsOptional()
  owner?: string;
}
