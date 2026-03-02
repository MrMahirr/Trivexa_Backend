import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelTimeEntryDto {
  @ApiProperty({
    example: 'Yanlış proje seçildi',
    description: 'Cancellation reason (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
