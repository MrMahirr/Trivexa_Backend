import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProjectStatusDto {
  @ApiProperty({
    example: 'IN_PROGRESS',
    description: 'New project status (PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED, ARCHIVED)',
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}
