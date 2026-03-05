import { ApiProperty } from '@nestjs/swagger';
import { StandardResponseDto, PaginatedDataDto } from '../../../../../shared/dto/api-response.dto';

export class UserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'test@trivexa.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  last_name: string;

  @ApiProperty({ example: 'ADMIN' })
  role: string;

  @ApiProperty({ example: 'IT', required: false })
  department?: string;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  created_at: Date;
}

export class PaginatedUsersDataDto extends PaginatedDataDto<UserDto> {
  @ApiProperty({ type: () => [UserDto] })
  items: UserDto[];
}

export class UsersListResponseDto extends StandardResponseDto<PaginatedUsersDataDto> {
  @ApiProperty({ type: () => PaginatedUsersDataDto })
  data: PaginatedUsersDataDto;
}

export class UserSingleResponseDto extends StandardResponseDto<UserDto> {
  @ApiProperty({ type: () => UserDto })
  data: UserDto;
}
