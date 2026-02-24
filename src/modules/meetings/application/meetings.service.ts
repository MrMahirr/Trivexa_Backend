import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMeetingDto } from '../api/dto/create-meeting.dto';
import { Meeting } from '../domain/meeting.entity';
import { MeetingsRepository } from '../infrastructure/meetings.repository';
import { MeetingNotFoundException } from '../domain/meeting.errors';

@Injectable()
export class MeetingsService {
  constructor(private readonly meetingsRepository: MeetingsRepository) {}

  async create(dto: CreateMeetingDto, userId: string) {
    const meeting = new Meeting();
    meeting.clientId = dto.clientId;
    meeting.projectId = dto.projectId;
    meeting.title = dto.title;
    meeting.date = new Date(dto.date);
    meeting.durationMinutes = dto.durationMinutes || 60;
    meeting.link = dto.link;
    meeting.notes = dto.notes;
    meeting.organizerId = userId;

    return this.meetingsRepository.create(meeting);
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
