import { ApiProperty } from '@nestjs/swagger';
import { StandardResponseDto } from '../../../../../shared/dto/api-response.dto';

class UserPayloadDto {
  @ApiProperty({ example: 'user-uuid' })
  id: string;

  @ApiProperty({ example: 'admin@trivexa.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'ADMIN' })
  role: string;

  @ApiProperty({ example: 'IT', required: false })
  department?: string;

  @ApiProperty({ example: false })
  forcePasswordChange: boolean;
}

export class LoginDataDto {
  @ApiProperty({ example: 'ey.header.payload.signature' })
  accessToken: string;

  @ApiProperty({ example: 'ey.header.payload.signature' })
  refreshToken: string;

  @ApiProperty({ type: () => UserPayloadDto })
  user: UserPayloadDto;
}

export class LoginResponseDto extends StandardResponseDto<LoginDataDto> {
  @ApiProperty({ type: () => LoginDataDto })
  data: LoginDataDto;
}

export class RefreshDataDto {
  @ApiProperty({ example: 'ey.header.payload.signature' })
  accessToken: string;

  @ApiProperty({ example: 'ey.header.payload.signature' })
  refreshToken: string;
}

export class RefreshResponseDto extends StandardResponseDto<RefreshDataDto> {
  @ApiProperty({ type: () => RefreshDataDto })
  data: RefreshDataDto;
}
