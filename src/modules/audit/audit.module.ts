import { Module } from '@nestjs/common';
import { AuditRepository } from './infrastructure/audit.repository';
import { WriteAuditLogUseCase } from './application/usecases/write-audit-log.usecase';
import { AuditLogRepository } from './infrastructure/repositories/audit-log.repository';
import { ListAuditLogsUseCase } from './application/usecases/list-audit-logs.usecase';
import { AuditController } from './api/audit.controller';
import { RunAuditRetentionUseCase } from './application/usecases/run-audit-retention.usecase';

@Module({
  controllers: [AuditController],
  providers: [
    AuditRepository,
    WriteAuditLogUseCase,
    AuditLogRepository,
    ListAuditLogsUseCase,
    RunAuditRetentionUseCase,
  ],
  exports: [
    AuditRepository,
    WriteAuditLogUseCase,
    AuditLogRepository,
    ListAuditLogsUseCase,
    RunAuditRetentionUseCase,
  ],
})
export class AuditModule {}
