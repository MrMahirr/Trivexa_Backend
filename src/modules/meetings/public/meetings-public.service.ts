import { Injectable } from '@nestjs/common';
import { MeetingsRepository } from '../infrastructure/meetings.repository';
import { MeetingEntity } from '../domain/meeting.entity';

@Injectable()
export class MeetingsPublicService {
  constructor(private readonly meetingsRepo: MeetingsRepository) {}

  async findById(id: string): Promise<MeetingEntity | null> {
    return this.meetingsRepo.findById(id);
  }

  async exists(id: string): Promise<boolean> {
    const meeting = await this.meetingsRepo.findById(id);
    return !!meeting;
  }
}
