import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CLIENT_PORTAL_REQUEST_STAGES } from '../../domain/client-portal-request.constants';

export class UpdateClientPortalRequestStageDto {
  @ApiProperty({
    enum: CLIENT_PORTAL_REQUEST_STAGES,
    example: 'ANALIZ',
    description: 'Onaylanan talebin mevcut asamasi',
  })
  @IsEnum(CLIENT_PORTAL_REQUEST_STAGES)
  stage: string;
}
