import { ApiProperty } from '@nestjs/swagger';
import { StandardResponseDto } from '../../../../../shared/dto/api-response.dto';

export class DepartmentDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Engineering' })
  name: string;

  @ApiProperty({ example: 'uuid', required: false })
  manager_id?: string;

  @ApiProperty({ example: 'uuid', required: false })
  parent_department_id?: string;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  created_at: Date;
}

export class DepartmentsListResponseDto extends StandardResponseDto<DepartmentDto[]> {
  @ApiProperty({ type: () => [DepartmentDto] })
  data: DepartmentDto[];
}

export class DepartmentSingleResponseDto extends StandardResponseDto<DepartmentDto> {
  @ApiProperty({ type: () => DepartmentDto })
  data: DepartmentDto;
}
