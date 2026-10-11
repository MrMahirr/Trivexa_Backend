import { ApiProperty } from '@nestjs/swagger';
import {
  StandardResponseDto,
  PaginatedDataDto,
} from '../../../../../shared/dto/api-response.dto';

export class ProjectDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid', required: false })
  client_id?: string;

  @ApiProperty({ example: 'New Website Design' })
  name: string;

  @ApiProperty({
    example: 'Redesigning the corporate website',
    required: false,
  })
  description?: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', required: false })
  start_date?: Date;

  @ApiProperty({ example: '2023-12-31T00:00:00Z', required: false })
  deadline?: Date;

  @ApiProperty({ example: 5000, required: false })
  budget?: number;

  @ApiProperty({
    example: 'https://github.com/trivexa/project',
    required: false,
  })
  github_repository_url?: string;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  created_at: Date;
}

export class PaginatedProjectsDataDto extends PaginatedDataDto<ProjectDto> {
  @ApiProperty({ type: () => [ProjectDto] })
  items: ProjectDto[];
}

export class ProjectsListResponseDto extends StandardResponseDto<PaginatedProjectsDataDto> {
  @ApiProperty({ type: () => PaginatedProjectsDataDto })
  data: PaginatedProjectsDataDto;
}

export class ProjectSingleResponseDto extends StandardResponseDto<ProjectDto> {
  @ApiProperty({ type: () => ProjectDto })
  data: ProjectDto;
}
