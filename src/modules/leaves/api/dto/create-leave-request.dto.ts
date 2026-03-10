import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { LeaveType } from '../../domain/leave.enums';

export class CreateLeaveRequestDto {
  @ApiPropertyOptional({ description: 'Request user id (optional for self requests)' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ enum: LeaveType })
  @IsEnum(LeaveType)
  type: LeaveType;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 3 })
  @Min(1)
  durationDays: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Department snapshot (optional)' })
  @IsOptional()
  @IsString()
  department?: string;
}
