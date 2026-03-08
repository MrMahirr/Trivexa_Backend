import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TICKET_PRIORITIES, TICKET_TYPES } from '../../../tickets/domain/ticket.entity';

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
}
