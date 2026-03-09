import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from '../api/dto/create-meeting.dto';
import { UpdateMeetingDto } from '../api/dto/update-meeting.dto';
import { MeetingsRepository } from '../infrastructure/meetings.repository';
import { MeetingNotFoundException } from '../domain/meeting.errors';
import { CreateMeetingUseCase } from './usecases/create-meeting.usecase';
import { ConvertToTicketDto } from '../api/dto/convert-to-ticket.dto';
import { ConvertToTicketUseCase } from './usecases/convert-to-ticket.usecase';
import { UpdateMeetingUseCase } from './usecases/update-meeting.usecase';
import { MeetingAccessContext } from '../infrastructure/meetings.repository';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly meetingsRepository: MeetingsRepository,
    private readonly createMeetingUseCase: CreateMeetingUseCase,
    private readonly convertToTicketUseCase: ConvertToTicketUseCase,
    private readonly updateMeetingUseCase: UpdateMeetingUseCase,
  ) {}

  async create(dto: CreateMeetingDto, userId: string) {
    return this.createMeetingUseCase.execute(dto, userId);
  }

  async convertToTicket(
    meetingId: string,
    dto: ConvertToTicketDto,
    userId: string,
  ) {
    return this.convertToTicketUseCase.execute(meetingId, dto, userId);
  }

  async findAll(query: {
    clientId?: string;
    projectId?: string;
  }, access?: MeetingAccessContext) {
    return this.meetingsRepository.findAll(query, access);
  }

  async findById(id: string) {
    const meeting = await this.meetingsRepository.findById(id);
    if (!meeting) throw new MeetingNotFoundException();
    return meeting;
  }

  async findByIdForUser(id: string, access: MeetingAccessContext) {
    const meeting = await this.meetingsRepository.findByIdForUser(id, access);
    if (!meeting) throw new MeetingNotFoundException();
    return meeting;
  }

  async update(id: string, dto: UpdateMeetingDto, userId: string) {
    return this.updateMeetingUseCase.execute(id, dto, userId);
  }
}
