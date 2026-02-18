import { Module } from '@nestjs/common';
import { AuditService } from './application/audit.service';
import { AuditRepository } from './infrastructure/audit.repository';
import { AuditInterceptor } from './api/interceptors/audit.interceptor';
import { WriteAuditLogUseCase } from './application/usecases/write-audit-log.usecase';

@Module({
    providers: [AuditRepository, WriteAuditLogUseCase],
    exports: [AuditRepository, WriteAuditLogUseCase],
})
export class AuditModule { }
