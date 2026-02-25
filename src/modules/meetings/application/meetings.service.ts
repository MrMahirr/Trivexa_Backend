import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMeetingDto } from '../api/dto/create-meeting.dto';
import { Meeting } from '../domain/meeting.entity';
import { MeetingsRepository } from '../infrastructure/meetings.repository';
import { MeetingNotFoundException } from '../domain/meeting.errors';
import { CreateMeetingUseCase } from './usecases/create-meeting.usecase';
import { ConvertToTicketUseCase } from './usecases/convert-to-ticket.usecase';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly meetingsRepository: MeetingsRepository,
    private readonly createMeetingUseCase: CreateMeetingUseCase,
    private readonly convertToTicketUseCase: ConvertToTicketUseCase
  ) { }

  async create(dto: CreateMeetingDto, userId: string) {
    return this.createMeetingUseCase.execute(dto, userId);
  }

  async convertToTicket(meetingId: string, userId: string, customSubject?: string) {
    return this.convertToTicketUseCase.execute(meetingId, userId, customSubject);
  }

  async findAll(query: {
    clientId?: string;
    projectId?: string;
    organizerId?: string;
  }) {
    return this.meetingsRepository.findAll(query);
  }

  async findById(id: string) {
    const meeting = await this.meetingsRepository.findById(id);
    if (!meeting) throw new MeetingNotFoundException();
    return meeting;
  }
}
