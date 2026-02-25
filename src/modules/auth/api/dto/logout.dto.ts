import { ApiPropertyOptional } from '@nestjs/swagger';

export class LogoutDto {
    @ApiPropertyOptional({ description: 'Optional refresh token to invalidate along with the access token' })
    refreshToken?: string;
}
