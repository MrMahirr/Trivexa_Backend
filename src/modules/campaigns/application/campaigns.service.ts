import { Injectable } from '@nestjs/common';
import { CampaignsRepository } from '../infrastructure/campaigns.repository';
import { CreateCampaignDto } from '../api/dto/create-campaign.dto';
import { UpdateCampaignDto } from '../api/dto/update-campaign.dto';
import { ListCampaignsQueryDto } from '../api/dto/list-campaigns.query.dto';
import { CampaignStatus } from '../domain/campaign.entity';

@Injectable()
export class CampaignsService {
  constructor(private readonly campaignsRepository: CampaignsRepository) {}

  async findAll(query: ListCampaignsQueryDto) {
    const { data, total } = await this.campaignsRepository.findAll({
      projectId: query.projectId,
      status: query.status,
      platform: query.platform,
      objective: query.objective,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    const page = query.page || 1;
    const limit = query.limit || 50;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return this.campaignsRepository.findById(id);
  }

  async create(dto: CreateCampaignDto, userId: string | null) {
    const created = await this.campaignsRepository.create({
      id: '',
      projectId: dto.projectId ?? null,
      title: dto.title,
      description: dto.description ?? null,
      platform: dto.platform,
      objective: dto.objective,
      status: dto.status ?? CampaignStatus.DRAFT,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      budget: dto.budget ?? 0,
      owner: dto.owner ?? null,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.campaignsRepository.findById(created.id);
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const updated = await this.campaignsRepository.update(id, {
      projectId: dto.projectId,
      title: dto.title,
      description: dto.description,
      platform: dto.platform,
      objective: dto.objective,
      status: dto.status,
      startDate: dto.startDate,
      endDate: dto.endDate,
      budget: dto.budget,
      owner: dto.owner,
    });

    return updated ? this.campaignsRepository.findById(updated.id) : null;
  }

  async updateStatus(id: string, status: CampaignStatus) {
    const updated = await this.campaignsRepository.updateStatus(id, status);
    return updated ? this.campaignsRepository.findById(updated.id) : null;
  }

  async remove(id: string) {
    await this.campaignsRepository.remove(id);
  }
}
