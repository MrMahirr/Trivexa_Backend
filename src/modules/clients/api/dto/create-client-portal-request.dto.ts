import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  TICKET_PRIORITIES,
  TICKET_TYPES,
} from '../../../tickets/domain/ticket.entity';

export class CreateClientPortalRequestDto {
  @ApiProperty({
    example: 'Dashboard alaninda veriler yuklenmiyor',
    description: 'Talep basligi',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'Musteri panelinde dashboard acildiginda bos gorunuyor.',
    description: 'Talep aciklamasi',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: TICKET_PRIORITIES,
    example: 'MEDIUM',
    required: false,
  })
  @IsOptional()
  @IsEnum(TICKET_PRIORITIES)
  priority?: string;

  @ApiProperty({
    enum: TICKET_TYPES,
    example: 'SUPPORT',
    required: false,
  })
  @IsOptional()
  @IsEnum(TICKET_TYPES)
  type?: string;

  @ApiProperty({
    example: '30fbb706-33a2-46cc-8f6d-7d95a4c2e1e8',
    required: false,
    description: 'Ilgili proje ID',
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
