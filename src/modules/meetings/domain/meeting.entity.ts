import { MeetingAudienceType } from './meeting-audience-type.enum';

export interface MeetingEntity {
  id: string;
  clientId?: string;
  projectId?: string;
  audienceType: MeetingAudienceType;
  department?: string;
  title: string;
  date: Date;
  durationMinutes: number;
  link?: string;
  notes?: string;
  summary?: string;
  organizerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Meeting implements MeetingEntity {
  id: string;
  clientId?: string;
  projectId?: string;
  audienceType: MeetingAudienceType;
  department?: string;
  title: string;
  date: Date;
  durationMinutes: number;
  link?: string;
  notes?: string;
  summary?: string;
  organizerId?: string;
  createdAt: Date;
  updatedAt: Date;

  static fromRow(row: any): Meeting {
    const entity = new Meeting();
    entity.id = row.id;
    entity.clientId = row.client_id;
    entity.projectId = row.project_id;
    entity.audienceType = row.audience_type ?? MeetingAudienceType.PERSONAL;
    entity.department = row.department ?? undefined;
    entity.title = row.title;
    entity.date = row.date;
    entity.durationMinutes = row.duration_minutes;
    entity.link = row.link;
    entity.notes = row.notes;
    entity.summary = row.summary;
    entity.organizerId = row.organizer_id;
    entity.createdAt = row.created_at;
    entity.updatedAt = row.updated_at;
    return entity;
  }
}
