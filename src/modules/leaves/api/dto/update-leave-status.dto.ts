import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { LeaveStatus } from '../../domain/leave.enums';

export class UpdateLeaveStatusDto {
  @ApiProperty({ enum: LeaveStatus })
  @IsEnum(LeaveStatus)
  status: LeaveStatus;
}
