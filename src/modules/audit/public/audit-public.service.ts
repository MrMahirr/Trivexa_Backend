import { Injectable } from '@nestjs/common';
import { WriteAuditLogUseCase } from '../application/usecases/write-audit-log.usecase';

@Injectable()
export class AuditPublicService {
    constructor(private readonly writeAuditLogUseCase: WriteAuditLogUseCase) { }

    /**
     * Exposes audit writing to other modules robustly
     */
    async logAction(data: any): Promise<void> {
        await this.writeAuditLogUseCase.execute(data);
    }
}
