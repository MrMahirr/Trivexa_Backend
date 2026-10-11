export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export enum CampaignPlatform {
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  TIKTOK = 'TIKTOK',
  GOOGLE_ADS = 'GOOGLE_ADS',
  LINKEDIN = 'LINKEDIN',
}

export enum CampaignObjective {
  AWARENESS = 'AWARENESS',
  ENGAGEMENT = 'ENGAGEMENT',
  LEADS = 'LEADS',
  SALES = 'SALES',
}

export interface CampaignEntity {
  id: string;
  projectId?: string | null;
  projectName?: string | null;
  title: string;
  description?: string | null;
  platform: CampaignPlatform;
  objective: CampaignObjective;
  status: CampaignStatus;
  startDate: Date;
  endDate: Date;
  budget: number;
  owner?: string | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Campaign implements CampaignEntity {
  id: string;
  projectId?: string | null;
  projectName?: string | null;
  title: string;
  description?: string | null;
  platform: CampaignPlatform;
  objective: CampaignObjective;
  status: CampaignStatus;
  startDate: Date;
  endDate: Date;
  budget: number;
  owner?: string | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromRow(row: any): Campaign {
    const entity = new Campaign();
    entity.id = row.id;
    entity.projectId = row.project_id ?? null;
    entity.projectName = row.project_name ?? null;
    entity.title = row.title;
    entity.description = row.description ?? null;
    entity.platform = row.platform as CampaignPlatform;
    entity.objective = row.objective as CampaignObjective;
    entity.status = row.status as CampaignStatus;
    entity.startDate = row.start_date;
    entity.endDate = row.end_date;
    entity.budget = Number(row.budget ?? 0);
    entity.owner = row.owner ?? null;
    entity.createdBy = row.created_by ?? null;
    entity.createdAt = row.created_at;
    entity.updatedAt = row.updated_at;
    return entity;
  }
}
