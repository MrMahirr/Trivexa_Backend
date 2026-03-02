import { Injectable } from '@nestjs/common';
import { MeetingsRepository } from '../../infrastructure/meetings.repository';
import { MeetingNotFoundException } from '../../domain/meeting.errors';
import { UpdateMeetingDto } from '../../api/dto/update-meeting.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class UpdateMeetingUseCase {
  constructor(
    private readonly meetingsRepo: MeetingsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, dto: UpdateMeetingDto, userId: string) {
    const meeting = await this.meetingsRepo.findById(id);
    if (!meeting) {
      throw new MeetingNotFoundException();
    }

    const updated = await this.meetingsRepo.update(id, {
      title: dto.title,
      date: dto.date,
      durationMinutes: dto.durationMinutes,
      clientId: dto.clientId,
      projectId: dto.projectId,
      link: dto.link,
      notes: dto.notes,
      summary: dto.summary,
    });

    this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
      action: 'meeting_updated',
      entity: 'MEETING',
      entityId: id,
      userId,
      details: { updatedFields: Object.keys(dto).filter((k) => dto[k] !== undefined) },
    });

    return updated;
  }
}
