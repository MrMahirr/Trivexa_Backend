import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ContractsController } from './api/contracts.controller';
import { ContractsService } from './application/contracts.service';
import { ContractsRepository } from './infrastructure/contracts.repository';
import { CreateContractUseCase } from './application/usecases/create-contract.usecase';
import { UpdateStatusUseCase } from './application/usecases/update-status.usecase';
import { ListExpiringContractsUseCase } from './application/usecases/list-expiring-contracts.usecase';
import { ContractsPublicService } from './public/contracts-public.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    ContractsService,
    ContractsRepository,
    CreateContractUseCase,
    UpdateStatusUseCase,
    ListExpiringContractsUseCase,
    ContractsPublicService,
  ],
  controllers: [ContractsController],
  exports: [ContractsService, ContractsPublicService],
})
export class ContractsModule {}
