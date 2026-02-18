import { Injectable } from '@nestjs/common';
import { AuditRepository } from '../infrastructure/audit.repository';

@Injectable()
export class AuditService {
    constructor(private readonly auditRepository: AuditRepository) { }

    async log(data: any) {
        return this.auditRepository.create(data);
    }
}
