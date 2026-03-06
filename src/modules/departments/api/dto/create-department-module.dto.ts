import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDepartmentModuleDto {
  @ApiProperty({
    description: 'Sub-module name under selected department',
    example: 'BACKEND_DEVELOPER',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Sub-module description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Team leader user id for this sub-module',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  teamLeadId: string;
}
