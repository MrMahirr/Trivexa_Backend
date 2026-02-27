import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class IssueClientAccessLinkDto {
    @ApiProperty({
        description: 'The UUID of the client user (optional if email is provided).',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID(4, { message: 'Geçerli bir istemci ID girilmelidir.' })
    clientId?: string;

    @ApiProperty({
        description: 'The email address of the client user.',
        example: 'client@company.com',
        required: false,
    })
    @IsOptional()
    @IsEmail({}, { message: 'Geçerli bir e-posta adresi girilmelidir.' })
    email?: string;
}
