import { Injectable, NotFoundException } from '@nestjs/common';
import { DepartmentsRepository } from '../../infrastructure/repositories/department.repository';

@Injectable()
export class DeleteDepartmentModuleUseCase {
  constructor(private readonly departmentsRepository: DepartmentsRepository) {}

  async execute(moduleId: string): Promise<void> {
    const deleted = await this.departmentsRepository.deleteModule(moduleId);
    if (!deleted) {
      throw new NotFoundException(
        `Department module with id ${moduleId} not found`,
      );
    }
  }
}
