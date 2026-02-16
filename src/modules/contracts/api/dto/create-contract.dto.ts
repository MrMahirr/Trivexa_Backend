import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ContractStatus } from '../../domain/contract.entity';

export class CreateContractDto {
    @IsUUID()
    @IsNotEmpty()
    clientId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    value?: number;

    @IsEnum(ContractStatus)
    @IsOptional()
    status?: ContractStatus = ContractStatus.DRAFT;
}
