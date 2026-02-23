import { Module } from '@nestjs/common';
import { AuditRepository } from './infrastructure/audit.repository';
import { WriteAuditLogUseCase } from './application/usecases/write-audit-log.usecase';

@Module({
  providers: [AuditRepository, WriteAuditLogUseCase],
  exports: [AuditRepository, WriteAuditLogUseCase],
})
export class AuditModule {}
