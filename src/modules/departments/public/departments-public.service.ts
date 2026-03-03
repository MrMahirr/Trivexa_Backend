import { Injectable } from '@nestjs/common';
import { DepartmentsRepository } from '../infrastructure/repositories/department.repository';
import { DepartmentEntity } from '../domain/entities/department.entity';

@Injectable()
export class DepartmentsPublicService {
  constructor(private readonly deptRepo: DepartmentsRepository) {}

  async findAll(): Promise<DepartmentEntity[]> {
    return this.deptRepo.findAll();
  }

  async findById(id: string): Promise<DepartmentEntity | null> {
    return this.deptRepo.findById(id);
  }

  async exists(id: string): Promise<boolean> {
    const dept = await this.deptRepo.findById(id);
    return !!dept;
  }
}
