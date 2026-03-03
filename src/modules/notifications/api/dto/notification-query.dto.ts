import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationQueryDto {
  @ApiProperty({
    example: false,
    description: 'Filter by read status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isRead?: boolean;

  @ApiProperty({
    example: 'SYSTEM',
    description: 'Notification type',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;
}
