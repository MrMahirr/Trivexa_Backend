import { Injectable } from '@nestjs/common';
import { DepartmentsRepository } from '../../infrastructure/repositories/department.repository';

@Injectable()
export class GetDepartmentsUseCase {
  constructor(private readonly departmentsRepo: DepartmentsRepository) {}

  async execute() {
    return this.departmentsRepo.findAll();
  }
}
