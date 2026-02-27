import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class ForceChangeClientPasswordDto {
    @ApiProperty({
        description: 'The UUID of the client user to change password for.',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty({ message: 'İstemci ID alanı zorunludur.' })
    @IsUUID(4, { message: 'Geçerli bir istemci ID girilmelidir.' })
    clientId: string;

    @ApiProperty({
        description: 'The new password to be set for the client user.',
        example: 'NewSecurePass123!',
        minLength: 8,
    })
    @IsNotEmpty({ message: 'Yeni şifre alanı zorunludur.' })
    @IsString({ message: 'Şifre metin formatında olmalıdır.' })
    @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır.' })
    newPassword: string;
}
