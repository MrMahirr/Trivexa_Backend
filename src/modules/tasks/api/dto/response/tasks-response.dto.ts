import { ApiProperty } from '@nestjs/swagger';
import { StandardResponseDto, PaginatedDataDto } from '../../../../../shared/dto/api-response.dto';

export class TaskDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  project_id: string;

  @ApiProperty({ example: 'uuid', required: false })
  assignee_id?: string;

  @ApiProperty({ example: 'Fix login bug' })
  title: string;

  @ApiProperty({ example: 'Users cannot login...', required: false })
  description?: string;

  @ApiProperty({ example: 'TODO' })
  status: string;

  @ApiProperty({ example: 'HIGH' })
  priority: string;

  @ApiProperty({ example: '2023-12-31T00:00:00Z', required: false })
  due_date?: Date;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  created_at: Date;
}

export class PaginatedTasksDataDto extends PaginatedDataDto<TaskDto> {
  @ApiProperty({ type: () => [TaskDto] })
  items: TaskDto[];
}

export class TasksListResponseDto extends StandardResponseDto<PaginatedTasksDataDto> {
  @ApiProperty({ type: () => PaginatedTasksDataDto })
  data: PaginatedTasksDataDto;
}

export class TaskSingleResponseDto extends StandardResponseDto<TaskDto> {
  @ApiProperty({ type: () => TaskDto })
  data: TaskDto;
}
