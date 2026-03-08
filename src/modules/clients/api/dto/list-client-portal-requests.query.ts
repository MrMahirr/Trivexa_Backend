import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TICKET_TYPES,
} from '../../../tickets/domain/ticket.entity';

export class ListClientPortalRequestsQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'acil hata', description: 'Search by subject, description, company or requester' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: TICKET_STATUSES, example: 'OPEN' })
  @IsOptional()
  @IsEnum(TICKET_STATUSES)
  status?: string;

  @ApiPropertyOptional({ enum: TICKET_PRIORITIES, example: 'HIGH' })
  @IsOptional()
  @IsEnum(TICKET_PRIORITIES)
  priority?: string;

  @ApiPropertyOptional({ enum: TICKET_TYPES, example: 'SUPPORT' })
  @IsOptional()
  @IsEnum(TICKET_TYPES)
  type?: string;

  @ApiPropertyOptional({ example: '30fbb706-33a2-46cc-8f6d-7d95a4c2e1e8' })
  @IsOptional()
  @IsUUID()
  clientId?: string;
}
