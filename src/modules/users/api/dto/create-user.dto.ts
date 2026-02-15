import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';
import { Role } from '../../../../shared/enums';
import { Department } from '../../../../shared/enums';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8)
    @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least 1 uppercase letter' })
    @Matches(/(?=.*\d)/, { message: 'Password must contain at least 1 number' })
    password: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEnum(Role)
    role: Role;

    @IsEnum(Department)
    @IsOptional()
    department?: Department;
}
