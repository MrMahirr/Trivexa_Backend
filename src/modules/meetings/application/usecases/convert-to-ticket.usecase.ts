import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MeetingsRepository } from '../../infrastructure/meetings.repository';
import { CreateTicketUseCase } from '../../../tickets/application/usecases/create-ticket.usecase';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class ConvertToTicketUseCase {
    private readonly logger = new Logger(ConvertToTicketUseCase.name);

    constructor(
        private readonly meetingsRepo: MeetingsRepository,
        private readonly createTicketUseCase: CreateTicketUseCase,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async execute(meetingId: string, userId: string, customSubject?: string) {
        const meeting = await this.meetingsRepo.findById(meetingId);
        if (!meeting) {
            throw new NotFoundException('Meeting not found');
        }

        // Toplantı notlarını veya başlığını kullanarak bir ticket oluşturalım
        const subject = customSubject || `Action Item from Meeting: ${meeting.title}`;
        const description = meeting.notes ? `Meeting Notes:\n\n${meeting.notes}` : `Auto-generated ticket from meeting ${meeting.id}.`;

        const ticket = await this.createTicketUseCase.execute({
            subject,
            description,
            type: 'TASK',
            priority: 'MEDIUM',
        }, userId);

        this.logger.log(`Meeting ${meetingId} converted to Ticket ${ticket.id}`);

        this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
            action: 'meeting_converted_to_ticket',
            entity: 'MEETING',
            entityId: meetingId,
            userId: userId,
            details: { ticketId: ticket.id }
        });

        return ticket;
    }
}
