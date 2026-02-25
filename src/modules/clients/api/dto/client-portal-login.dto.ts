import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ClientPortalLoginDto {
    @ApiProperty({ example: 'john.doe@client.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'SecureP@ssw0rd!' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
}
