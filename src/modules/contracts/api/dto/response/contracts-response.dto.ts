import { ApiProperty } from '@nestjs/swagger';
import {
  StandardResponseDto,
  PaginatedDataDto,
} from '../../../../../shared/dto/api-response.dto';

export class ContractDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  client_id: string;

  @ApiProperty({ example: 'uuid', required: false })
  project_id?: string;

  @ApiProperty({ example: 'Service Level Agreement' })
  title: string;

  @ApiProperty({ example: 'DRAFT' })
  status: string;

  @ApiProperty({ example: 10000.0, required: false })
  value?: number;

  @ApiProperty({ example: '2026-03-05T00:00:00Z' })
  start_date: Date;

  @ApiProperty({ example: '2027-03-05T00:00:00Z', required: false })
  end_date?: Date;

  @ApiProperty({ example: '2026-03-05T12:00:00Z' })
  created_at: Date;
}

export class PaginatedContractsDataDto extends PaginatedDataDto<ContractDto> {
  @ApiProperty({ type: () => [ContractDto] })
  items: ContractDto[];
}

export class ContractsListResponseDto extends StandardResponseDto<PaginatedContractsDataDto> {
  @ApiProperty({ type: () => PaginatedContractsDataDto })
  data: PaginatedContractsDataDto;
}

export class ContractSingleResponseDto extends StandardResponseDto<ContractDto> {
  @ApiProperty({ type: () => ContractDto })
  data: ContractDto;
}
