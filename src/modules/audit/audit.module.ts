import { Module } from '@nestjs/common';
import { AuditRepository } from './infrastructure/audit.repository';
import { WriteAuditLogUseCase } from './application/usecases/write-audit-log.usecase';
import { AuditLogRepository } from './infrastructure/repositories/audit-log.repository';
import { ListAuditLogsUseCase } from './application/usecases/list-audit-logs.usecase';
import { AuditController } from './api/audit.controller';

@Module({
  controllers: [AuditController],
  providers: [
    AuditRepository,
    WriteAuditLogUseCase,
    AuditLogRepository,
    ListAuditLogsUseCase,
  ],
  exports: [
    AuditRepository,
    WriteAuditLogUseCase,
    AuditLogRepository,
    ListAuditLogsUseCase,
  ],
})
export class AuditModule {}
