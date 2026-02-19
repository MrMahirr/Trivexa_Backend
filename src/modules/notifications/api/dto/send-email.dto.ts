import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
    @ApiProperty({ example: 'user@example.com', description: 'Recipient email address' })
    @IsEmail()
    @IsNotEmpty()
    to: string;

    @ApiProperty({ example: 'Test Subject', description: 'Email subject' })
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty({ example: 'Hello world', description: 'Email content (text or HTML)' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ example: false, description: 'Is content HTML?', required: false })
    @IsBoolean()
    @IsOptional()
    isHtml?: boolean;
}
