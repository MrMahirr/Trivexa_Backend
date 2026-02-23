import { IsOptional, IsUUID } from 'class-validator';

export class GenerateProjectAnalyticsDto {
  @IsUUID()
  @IsOptional()
  projectId?: string;
}
