import { Module } from '@nestjs/common';
import { PerformanceController } from './api/performance.controller';
import { PerformanceService } from './application/performance.service';
import { PerformanceRepository } from './infrastructure/performance.repository';

@Module({
  controllers: [PerformanceController],
  providers: [PerformanceService, PerformanceRepository],
  exports: [PerformanceService],
})
export class PerformanceModule {}
