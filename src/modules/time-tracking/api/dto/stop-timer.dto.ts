import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class StopTimerDto {
  @ApiProperty({
    description: 'Description of the work completed',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
