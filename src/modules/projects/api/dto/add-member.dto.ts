import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ example: 'uuid-of-user', description: 'User ID to add' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    description: 'Role of the user in the project',
    example: 'DEVELOPER',
    default: 'DEVELOPER',
  })
  @IsOptional()
  @IsString()
  role?: string = 'DEVELOPER';
}
