import {
    IsEmail,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateClientDto {
    @IsString()
    @IsOptional()
    companyName?: string;

    @IsString()
    @IsOptional()
    contactPerson?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;
}
