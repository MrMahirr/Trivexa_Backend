import {
  Injectable,
  } from '@nestjs/common';
import { UpdateDepartmentModuleDto } from '../../api/dto/update-department-module.dto';

import { DepartmentsRepository } from '../../infrastructure/repositories/department.repository';
import { DepartmentModuleEntity } from '../../domain/entities/department.entity';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { NotFoundError } from "../../../../shared/errors/not-found.error";
import { DomainError, DomainErrorType } from "../../../../shared/errors/domain.error";

@Injectable()
export class UpdateDepartmentModuleUseCase {
  constructor(
    private readonly departmentsRepository: DepartmentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    moduleId: string,
    dto: UpdateDepartmentModuleDto,
  ): Promise<DepartmentModuleEntity> {
    const existing = await this.departmentsRepository.findModuleById(moduleId);
    if (!existing) {
      throw new NotFoundError(
        `Department module with id ${moduleId} not found`,
      );
    }

    if (dto.teamLeadId) {
      const department = await this.departmentsRepository.findById(
        existing.departmentId,
      );

      if (!department) {
        throw new NotFoundError(
          `Department with id ${existing.departmentId} not found`,
        );
      }

      const leader = await this.usersRepository.findById(dto.teamLeadId);
      if (!leader) {
        throw new NotFoundError(
          `Team leader with id ${dto.teamLeadId} not found`,
        );
      }

      if (!leader.department || leader.department !== department.name) {
        throw new DomainError(
          'Team leader must be assigned to the same department as the sub-module', DomainErrorType.BUSINESS_RULE);
      }
    }

    const updated = await this.departmentsRepository.updateModule(moduleId, {
      name: dto.name,
      description: dto.description,
      teamLeadId: dto.teamLeadId,
    });

    if (!updated) {
      throw new NotFoundError(
        `Department module with id ${moduleId} not found`,
      );
    }

    return updated;
  }
}
