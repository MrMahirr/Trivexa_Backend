import { Injectable } from '@nestjs/common';

import { LeaveRequestsRepository } from '../infrastructure/leave-requests.repository';
import { LeaveRequestsQueryDto } from '../api/dto/leave-requests.query.dto';
import { UpdateLeaveStatusDto } from '../api/dto/update-leave-status.dto';
import { CreateLeaveRequestDto } from '../api/dto/create-leave-request.dto';
import { LeaveStatus } from '../domain/leave.enums';
import { NotFoundError } from "../../../shared/errors/not-found.error";

@Injectable()
export class LeaveRequestsService {
  constructor(private readonly leaveRepo: LeaveRequestsRepository) {}

  async findAll(query: LeaveRequestsQueryDto) {
    const data = await this.leaveRepo.findAll({
      status: query.status,
      type: query.type,
      department: query.department,
      search: query.search?.trim() || undefined,
    });
    return { data };
  }

  async create(dto: CreateLeaveRequestDto, user: any) {
    const userId = dto.userId ?? user?.userId;
    if (!userId) {
      throw new NotFoundError('Kullanici bilgisi bulunamadi.');
    }

    const created = await this.leaveRepo.create({
      userId,
      department: dto.department ?? user?.department ?? null,
      type: dto.type,
      status: LeaveStatus.PENDING,
      startDate: dto.startDate,
      endDate: dto.endDate,
      durationDays: dto.durationDays,
      reason: dto.reason ?? null,
    });

    if (!created) {
      throw new NotFoundError('Izin kaydi olusturulamadi.');
    }

    return { data: created };
  }

  async updateStatus(id: string, dto: UpdateLeaveStatusDto, user: any) {
    const status = dto.status;
    const approvedAt = status === LeaveStatus.PENDING ? null : new Date();

    const updated = await this.leaveRepo.updateStatus({
      id,
      status,
      approvedBy: user?.userId ?? null,
      approvedAt,
    });

    if (!updated) {
      throw new NotFoundError('Izin kaydi bulunamadi.');
    }

    return { data: updated };
  }
}
