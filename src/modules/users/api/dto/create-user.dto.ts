import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'newuser@example.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password (min 8 chars, 1 uppercase, 1 number)',
  })
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least 1 uppercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least 1 number' })
  password: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ enum: Role, example: Role.MEMBER, description: 'User role' })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    enum: Department,
    example: Department.DEVELOPMENT,
    description: 'User department',
    required: false,
  })
  @IsEnum(Department)
  @IsOptional()
  department?: Department;
}
