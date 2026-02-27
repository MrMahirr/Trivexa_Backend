import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../events/event.constants';
import { GenericAuditLogEvent } from '../events/event.types';

@Injectable()
export class SharedAuditService {
    private readonly logger = new Logger(SharedAuditService.name);

    constructor(private readonly eventEmitter: EventEmitter2) { }

    logAction(payload: GenericAuditLogEvent): void {
        this.logger.debug(`Loglama olayı aktarıldı: ${payload.action} -> ${payload.entityName}`);
        this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, payload);
    }
}
