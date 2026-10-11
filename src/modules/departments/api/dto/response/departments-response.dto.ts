import { ApiProperty } from '@nestjs/swagger';
import { StandardResponseDto } from '../../../../../shared/dto/api-response.dto';

export class DepartmentModuleDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  department_id: string;

  @ApiProperty({ example: 'BACKEND_DEVELOPER' })
  name: string;

  @ApiProperty({ example: 'uuid', required: false })
  team_lead_id?: string;

  @ApiProperty({ example: 'Sub module description', required: false })
  description?: string;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  updated_at: Date;
}

export class DepartmentDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Engineering' })
  name: string;

  @ApiProperty({ example: 'uuid', required: false })
  manager_id?: string;

  @ApiProperty({ example: 'Department description', required: false })
  description?: string;

  @ApiProperty({ type: () => [DepartmentModuleDto], required: false })
  modules?: DepartmentModuleDto[];

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  updated_at: Date;
}

export class DepartmentsListResponseDto extends StandardResponseDto<
  DepartmentDto[]
> {
  @ApiProperty({ type: () => [DepartmentDto] })
  data: DepartmentDto[];
}

export class DepartmentSingleResponseDto extends StandardResponseDto<DepartmentDto> {
  @ApiProperty({ type: () => DepartmentDto })
  data: DepartmentDto;
}
