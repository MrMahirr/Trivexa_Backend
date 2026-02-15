import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';
import { Role } from '../../../../shared/enums';
import { Department } from '../../../../shared/enums';

export class UpdateUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsEnum(Role)
    @IsOptional()
    role?: Role;

    @IsEnum(Department)
    @IsOptional()
    department?: Department;

    @IsString()
    @MinLength(8)
    @IsOptional()
    password?: string;
}
