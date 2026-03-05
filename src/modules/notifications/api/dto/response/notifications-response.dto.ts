import { ApiProperty } from '@nestjs/swagger';
import { StandardResponseDto, PaginatedDataDto } from '../../../../../shared/dto/api-response.dto';

export class NotificationDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  user_id: string;

  @ApiProperty({ example: 'SYSTEM' })
  type: string;

  @ApiProperty({ example: 'Welcome to Trivexa' })
  title: string;

  @ApiProperty({ example: 'Your account has been created successfully.' })
  message: string;

  @ApiProperty({ example: false })
  is_read: boolean;

  @ApiProperty({ example: 'uuid', required: false })
  reference_id?: string;

  @ApiProperty({ example: 'USER', required: false })
  reference_type?: string;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  created_at: Date;
}

export class PaginatedNotificationsDataDto extends PaginatedDataDto<NotificationDto> {
  @ApiProperty({ type: () => [NotificationDto] })
  items: NotificationDto[];
}

export class NotificationsListResponseDto extends StandardResponseDto<PaginatedNotificationsDataDto> {
  @ApiProperty({ type: () => PaginatedNotificationsDataDto })
  data: PaginatedNotificationsDataDto;
}

export class UnreadCountDto {
  @ApiProperty({ example: 5 })
  count: number;
}

export class UnreadCountResponseDto extends StandardResponseDto<UnreadCountDto> {
  @ApiProperty({ type: () => UnreadCountDto })
  data: UnreadCountDto;
}

export class EmailResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Email queued/sent' })
  message: string;
}

export class SuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}
