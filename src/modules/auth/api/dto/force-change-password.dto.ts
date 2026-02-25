import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { IsStrongPasswordValid } from '../../../../shared/security/password-policy';

export class ForceChangePasswordDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsStrongPasswordValid()
    newPassword: string;
}
