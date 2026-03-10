import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import {
  CampaignObjective,
  CampaignPlatform,
  CampaignStatus,
} from '../../domain/campaign.entity';

export class ListCampaignsQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 50, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @ApiPropertyOptional({ example: 'uuid', description: 'Project filter' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({ enum: CampaignPlatform })
  @IsOptional()
  @IsEnum(CampaignPlatform)
  platform?: CampaignPlatform;

  @ApiPropertyOptional({ enum: CampaignObjective })
  @IsOptional()
  @IsEnum(CampaignObjective)
  objective?: CampaignObjective;

  @ApiPropertyOptional({ example: 'spring' })
  @IsOptional()
  @IsString()
  search?: string;
}
