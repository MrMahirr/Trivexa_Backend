import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
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

export class UpdateCampaignDto {
  @ApiProperty({ example: 'Spring Launch', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsUUID()
  @IsOptional()
  projectId?: string | null;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ enum: CampaignPlatform, required: false })
  @IsEnum(CampaignPlatform)
  @IsOptional()
  platform?: CampaignPlatform;

  @ApiProperty({ enum: CampaignObjective, required: false })
  @IsEnum(CampaignObjective)
  @IsOptional()
  objective?: CampaignObjective;

  @ApiProperty({ enum: CampaignStatus, required: false })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @ApiProperty({ example: '2026-03-01', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2026-03-31', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 75000, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @ApiProperty({ example: 'Marketing Team', required: false })
  @IsString()
  @IsOptional()
  owner?: string | null;
}
