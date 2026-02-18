import { Injectable } from '@nestjs/common';
import { AuditRepository } from '../../infrastructure/audit.repository';
import { AuditLog } from '../../domain/audit-log.entity';

@Injectable()
export class WriteAuditLogUseCase {
    constructor(private readonly auditRepository: AuditRepository) { }

    async execute(data: {
        userId: string;
        action: string;
        resource: string;
        resourceId?: string;
        oldData?: any;
        newData?: any;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<AuditLog> {
        return this.auditRepository.create(data);
    }
}
