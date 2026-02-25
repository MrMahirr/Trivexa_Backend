import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientUserDto {
    @ApiProperty({ example: 'uuid-of-client' })
    @IsString()
    @IsNotEmpty()
    clientId: string;

    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: 'john.doe@client.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '+1234567890', required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: 'Marketing Director', required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ example: 'SecureP@ss!', required: false })
    @IsString()
    @IsOptional()
    password?: string;
}
