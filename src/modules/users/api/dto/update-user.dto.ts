import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Role } from '../../../../shared/enums';
import { Department } from '../../../../shared/enums';

export class UpdateUserDto {
  @ApiProperty({
    example: 'updated@example.com',
    description: 'User email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'John', description: 'First name', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    enum: Role,
    example: Role.MANAGER,
    description: 'User role',
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({
    enum: Department,
    example: Department.DESIGN,
    description: 'User department',
    required: false,
  })
  @IsEnum(Department)
  @IsOptional()
  department?: Department;

  @ApiProperty({
    example: 'de5dc340-79ba-4100-ae8a-f0ec1f2e3679',
    description: 'User sub-department module id',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  subDepartmentId?: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'New password',
    required: false,
  })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}
