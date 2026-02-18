import { Module } from '@nestjs/common';
import { AuditService } from './application/audit.service';
import { AuditRepository } from './infrastructure/audit.repository';
import { AuditInterceptor } from './api/interceptors/audit.interceptor';

@Module({
    providers: [AuditService, AuditRepository, AuditInterceptor],
    exports: [AuditService, AuditInterceptor],
})
export class AuditModule { }
