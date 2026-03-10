import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMyProfileDto {
  @ApiProperty({
    example: '+905555555555',
    description: 'User phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Istanbul, TR', description: 'User address', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '/uploads/avatar.png', description: 'Avatar URL', required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ example: 'cover', description: 'Avatar object-fit', required: false })
  @IsString()
  @IsOptional()
  avatarFit?: string;

  @ApiProperty({ example: 'center', description: 'Avatar object-position', required: false })
  @IsString()
  @IsOptional()
  avatarPosition?: string;
}
