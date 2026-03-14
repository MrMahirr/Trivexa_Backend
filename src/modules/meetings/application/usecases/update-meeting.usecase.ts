import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error';

import { MeetingsRepository } from '../../infrastructure/meetings.repository';
import { MeetingNotFoundException } from '../../domain/meeting.errors';
import { UpdateMeetingDto } from '../../api/dto/update-meeting.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';
import { MeetingAudienceType } from '../../domain/meeting-audience-type.enum';
import { DomainError, DomainErrorType } from "../../../../shared/errors/domain.error";

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
    const normalizedProjectId =
      dto.audienceType && dto.audienceType !== MeetingAudienceType.PROJECT
        ? null
        : dto.projectId;
    const normalizedDepartment =
      dto.audienceType && dto.audienceType !== MeetingAudienceType.DEPARTMENT
        ? null
        : dto.department?.trim()?.toUpperCase();

    const nextAudienceType = dto.audienceType ?? meeting.audienceType;
    const nextProjectId =
      normalizedProjectId === undefined
        ? meeting.projectId
        : normalizedProjectId;
    const nextDepartment =
      normalizedDepartment === undefined
        ? meeting.department
        : normalizedDepartment;

    if (nextAudienceType === MeetingAudienceType.PROJECT && !nextProjectId) {
      throw new DomainError(
        'Project scope meetings require a projectId', DomainErrorType.BUSINESS_RULE);
    }

    if (
      nextAudienceType === MeetingAudienceType.DEPARTMENT &&
      !nextDepartment?.trim()
    ) {
      throw new DomainError(
        'Department scope meetings require a department value', DomainErrorType.BUSINESS_RULE);
    }

    const updated = await this.meetingsRepo.update(id, {
      title: dto.title,
      date: dto.date,
      durationMinutes: dto.durationMinutes,
      clientId: dto.clientId,
      projectId: normalizedProjectId,
      audienceType: dto.audienceType,
      department: normalizedDepartment,
      link: dto.link,
      notes: dto.notes,
      summary: dto.summary,
    });

    this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
      action: 'meeting_updated',
      entity: 'MEETING',
      entityId: id,
      userId,
      details: {
        updatedFields: Object.keys(dto).filter(
          (key) => (dto as Record<string, unknown>)[key] !== undefined,
        ),
      },
    });

    return updated;
  }
}
