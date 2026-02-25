import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SystemEvents } from '../event.constants';
import { GenericAuditLogEvent } from '../event.types';
import { AuditLogRepository } from '../../../modules/audit/infrastructure/repositories/audit-log.repository';
import { AuditLog } from '../../../modules/audit/domain/entities/audit-log.entity';

@Injectable()
export class AuditEventHandlers {
    private readonly logger = new Logger(AuditEventHandlers.name);

    constructor(private readonly auditLogRepo: AuditLogRepository) { }

    @OnEvent(SystemEvents.AUDIT_LOG_CREATED, { async: true })
    async handleGenericAuditLogEvent(payload: GenericAuditLogEvent) {
        try {
            const logEntry = new AuditLog({
                entityName: payload.entityName,
                entityId: payload.entityId,
                action: payload.action,
                userId: payload.userId,
                details: payload.details,
                ipAddress: payload.ipAddress,
                userAgent: payload.userAgent,
            });

            await this.auditLogRepo.create(logEntry);

            this.logger.debug(`Audit log inserted for [${payload.action}] on ${payload.entityName}:${payload.entityId}`);
        } catch (error) {
            this.logger.error(`Failed to handle generic audit log event: ${error.message}`, error.stack);
        }
    }
}
