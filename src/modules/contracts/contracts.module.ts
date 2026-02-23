import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ContractsController } from './api/contracts.controller';
import { ContractsService } from './application/contracts.service';
import { ContractsRepository } from './infrastructure/contracts.repository';

@Module({
  imports: [DatabaseModule],
  providers: [ContractsService, ContractsRepository],
  controllers: [ContractsController],
  exports: [ContractsService],
})
export class ContractsModule {}
