import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ContractStatus } from '../../domain/contract.entity';

export class CreateContractDto {
  @ApiProperty({ example: 'uuid-of-client', description: 'Client ID' })
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    example: 'SEO Service Agreement',
    description: 'Contract title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Terms and conditions...',
    description: 'Contract description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2023-01-01', description: 'Start date (ISO 8601)' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: '2023-12-31',
    description: 'End date (ISO 8601)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 10000, description: 'Contract value' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;

  @ApiProperty({
    enum: ContractStatus,
    example: ContractStatus.DRAFT,
    description: 'Contract status',
    required: false,
  })
  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus = ContractStatus.DRAFT;
}
