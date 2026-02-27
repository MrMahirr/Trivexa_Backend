import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ContractStatus } from '../../domain/contract.entity';

export class ListContractsQueryDto {
    @ApiProperty({ description: 'Page number', required: false, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ description: 'Items per page', required: false, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @ApiProperty({ description: 'Filter by Client ID', required: false })
    @IsOptional()
    @IsString()
    clientId?: string;

    @ApiProperty({ description: 'Filter by Contract Status', enum: ContractStatus, required: false })
    @IsOptional()
    @IsEnum(ContractStatus)
    status?: ContractStatus;
}
