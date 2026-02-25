import { Injectable, Logger } from '@nestjs/common';
import { MeetingsRepository } from '../../infrastructure/meetings.repository';
import { CreateMeetingDto } from '../../api/dto/create-meeting.dto';
import { DatabasePool } from '../../../../database/pool';
import { Meeting } from '../../domain/meeting.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';
import { MeetingRules } from '../../domain/rules/meeting.rules';

@Injectable()
export class CreateMeetingUseCase {
    private readonly logger = new Logger(CreateMeetingUseCase.name);

    constructor(
        private readonly meetingsRepo: MeetingsRepository,
        private readonly db: DatabasePool,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async execute(dto: CreateMeetingDto, organizerId: string) {
        MeetingRules.validateMeetingDate(new Date(dto.date));
        MeetingRules.validateDuration(dto.durationMinutes);

        const client = await this.db.getPool().connect();
        try {
            await client.query('BEGIN');

            const meetingEntity = new Meeting();
            meetingEntity.clientId = dto.clientId;
            meetingEntity.projectId = dto.projectId;
            meetingEntity.title = dto.title;
            meetingEntity.date = new Date(dto.date);
            meetingEntity.durationMinutes = dto.durationMinutes;
            meetingEntity.link = dto.link;
            meetingEntity.notes = dto.notes;
            meetingEntity.organizerId = organizerId;

            const created = await this.meetingsRepo.create(meetingEntity, client);

            await client.query('COMMIT');
            this.logger.log(`Meeting created: ${created.title} by ${organizerId}`);

            this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
                action: 'meeting_created',
                entity: 'MEETING',
                entityId: created.id,
                userId: organizerId,
                details: { title: created.title },
            });

            return created;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}
