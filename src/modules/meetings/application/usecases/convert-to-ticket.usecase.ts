import {
  Injectable,
  } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { MeetingsRepository } from '../../infrastructure/meetings.repository';
import { ConvertToTicketDto } from '../../api/dto/convert-to-ticket.dto';
import { SystemEvents } from '../../../../shared/events/event.constants';
import { NotFoundError } from "../../../../shared/errors/not-found.error";
import { DomainError, DomainErrorType } from "../../../../shared/errors/domain.error";

@Injectable()
export class ConvertToTicketUseCase {
  constructor(
    private readonly meetingRepository: MeetingsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    meetingId: string,
    dto: ConvertToTicketDto,
    requestedByUserId: string,
  ) {
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new NotFoundError('Toplantı bulunamadı.');
    }

    if (!meeting.summary && !meeting.notes) {
      throw new DomainError(
        'Bu toplantının not veya özet bilgisi yok, bilete dönüştürülemez.', DomainErrorType.BUSINESS_RULE);
    }

    // Prepare ticket (task) payload
    const ticketTitle = `[Toplantı Kararı] ${meeting.title}`;
    let ticketBody = meeting.summary ? `**Özet:**\n${meeting.summary}\n\n` : '';
    ticketBody += meeting.notes ? `**Notlar:**\n${meeting.notes}` : '';

    if (dto.additionalNotes) {
      ticketBody += `\n\n**Ek Notlar:**\n${dto.additionalNotes}`;
    }

    // Dispatch event so that Tasks/Ticket module can catch and create it asynchronously
    // In a fully decoupled Clean Architecture, creating a Task belongs to the Tasks module.
    this.eventEmitter.emit(SystemEvents.MEETING_CONVERTED_TO_TICKET, {
      meetingId: meeting.id,
      projectId: dto.projectId,
      assigneeId: dto.assigneeId,
      priority: dto.priority,
      title: ticketTitle,
      description: ticketBody,
      createdBy: requestedByUserId,
    });

    return {
      message: 'Toplantı kararları başarıyla Bilet oluşturma sırasına eklendi.',
      meetingId: meeting.id,
    };
  }
}
