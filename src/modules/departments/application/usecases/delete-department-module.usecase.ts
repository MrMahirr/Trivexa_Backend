import { Injectable } from '@nestjs/common';
import { DepartmentsRepository } from '../../infrastructure/repositories/department.repository';
import { NotFoundError } from "../../../../shared/errors/not-found.error";

@Injectable()
export class DeleteDepartmentModuleUseCase {
  constructor(private readonly departmentsRepository: DepartmentsRepository) {}

  async execute(moduleId: string): Promise<void> {
    const deleted = await this.departmentsRepository.deleteModule(moduleId);
    if (!deleted) {
      throw new NotFoundError(
        `Department module with id ${moduleId} not found`,
      );
    }
  }
}
