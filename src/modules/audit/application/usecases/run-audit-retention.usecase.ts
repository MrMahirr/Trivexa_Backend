import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';

@Injectable()
export class RunAuditRetentionUseCase {
  constructor(private readonly auditLogRepo: AuditLogRepository) {}

  async execute(retentionDays = 180): Promise<{
    retentionDays: number;
    archivedCount: number;
    deletedCount: number;
  }> {
    const safeRetention = Number.isFinite(retentionDays) && retentionDays > 0
      ? Math.floor(retentionDays)
      : 180;
    const result = await this.auditLogRepo.archiveOlderThan(safeRetention);

    return {
      retentionDays: safeRetention,
      archivedCount: result.archivedCount,
      deletedCount: result.deletedCount,
    };
  }
}

