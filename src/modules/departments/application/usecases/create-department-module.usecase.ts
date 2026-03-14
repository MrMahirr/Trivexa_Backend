import {
  Injectable,
  } from '@nestjs/common';
import { CreateDepartmentModuleDto } from '../../api/dto/create-department-module.dto';

import { DepartmentsRepository } from '../../infrastructure/repositories/department.repository';
import { DepartmentModuleEntity } from '../../domain/entities/department.entity';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { NotFoundError } from "../../../../shared/errors/not-found.error";
import { DomainError, DomainErrorType } from "../../../../shared/errors/domain.error";

@Injectable()
export class CreateDepartmentModuleUseCase {
  constructor(
    private readonly departmentsRepository: DepartmentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    departmentId: string,
    dto: CreateDepartmentModuleDto,
  ): Promise<DepartmentModuleEntity> {
    const department = await this.departmentsRepository.findById(departmentId);
    if (!department) {
      throw new NotFoundError(
        `Department with id ${departmentId} not found`,
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
        'Team leader must be assigned to the same department as the sub-module',
        DomainErrorType.BUSINESS_RULE);
    }

    return this.departmentsRepository.createModule({
      departmentId,
      name: dto.name,
      description: dto.description,
      teamLeadId: dto.teamLeadId,
    });
  }
}
