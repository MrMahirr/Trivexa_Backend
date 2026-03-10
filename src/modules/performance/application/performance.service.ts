import { BadRequestException, Injectable } from '@nestjs/common';
import { PerformanceRepository } from '../infrastructure/performance.repository';
import { PerformanceQueryDto } from '../api/dto/performance-query.dto';
import { UpsertPerformanceDto } from '../api/dto/upsert-performance.dto';

@Injectable()
export class PerformanceService {
  constructor(private readonly performanceRepo: PerformanceRepository) {}

  async findAll(query: PerformanceQueryDto) {
    const data = await this.performanceRepo.findAll({
      userId: query.userId,
      startDate: query.startDate,
      endDate: query.endDate,
    });
    return { data };
  }

  async upsert(dto: UpsertPerformanceDto, user: any) {
    const start = new Date(dto.periodStart);
    const end = new Date(dto.periodEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Tarih araligi gecersiz.');
    }
    if (end < start) {
      throw new BadRequestException('Bitis tarihi baslangictan once olamaz.');
    }

    const created = await this.performanceRepo.upsert({
      userId: dto.userId,
      periodStart: dto.periodStart,
      periodEnd: dto.periodEnd,
      score: dto.score,
      bonusAmount: dto.bonusAmount,
      notes: dto.notes ?? null,
      createdBy: user?.userId ?? null,
    });

    if (!created) {
      throw new BadRequestException('Performans kaydi olusturulamadi.');
    }

    return { data: created };
  }
}
