import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';
import { ListAuditQueryDto } from '../../api/dto/list-audit.query';
import { PageDto } from '../../../../shared/dto/page.dto';
import { PageMetaDto } from '../../../../shared/dto/page-meta.dto';
import { AuditLog } from '../../domain/entities/audit-log.entity';

@Injectable()
export class ListAuditLogsUseCase {
  constructor(private readonly auditLogRepo: AuditLogRepository) {}

  async execute(query: ListAuditQueryDto): Promise<PageDto<AuditLog>> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const { data, total } = await this.auditLogRepo.findWithPagination(
      page,
      limit,
      {
        action: query.action,
        entity: query.entity,
        userId: query.userId,
      },
    );

    const pageMetaDto = new PageMetaDto({ itemCount: total, page, limit });

    return new PageDto(data, pageMetaDto);
  }
}
