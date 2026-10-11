import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '../../../../shared/enums';

export class CreateUserDto {
  @ApiProperty({ example: 'newuser@example.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password (min 8 chars, 1 uppercase, 1 number)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least 1 uppercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least 1 number' })
  password?: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    enum: Role,
    example: Role.DEVELOPER,
    description: 'User role',
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    example: 'DEVELOPMENT',
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
}
