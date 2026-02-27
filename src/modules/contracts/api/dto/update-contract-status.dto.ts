import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContractStatus } from '../../domain/contract.entity';

export class UpdateContractStatusDto {
    @ApiProperty({
        description: 'New status for the contract',
        enum: ContractStatus,
        example: ContractStatus.SIGNED,
    })
    @IsEnum(ContractStatus)
    @IsNotEmpty()
    status: ContractStatus;

    @ApiProperty({
        description: 'Optional URL to the signed contract document',
        required: false,
        example: 'https://s3.bucket.com/signed-contracts/123.pdf',
    })
    @IsOptional()
    @IsUrl()
    @IsString()
    signedUrl?: string;
}
