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
    example: 'DESIGN',
    description: 'User department name',
    required: false,
  })
  @IsString()
  @IsOptional()
  department?: string;

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

  @ApiProperty({
    example: '+905555555555',
    description: 'User phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'Istanbul, TR',
    description: 'User address',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: '/uploads/avatar.png',
    description: 'User avatar URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({
    example: 'cover',
    description: 'Avatar object-fit',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatarFit?: string;

  @ApiProperty({
    example: 'center',
    description: 'Avatar object-position',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatarPosition?: string;
}
