import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepartmentModuleDto } from '../../api/dto/create-department-module.dto';
import { DepartmentsRepository } from '../../infrastructure/repositories/department.repository';
import { DepartmentModuleEntity } from '../../domain/entities/department.entity';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

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
      throw new NotFoundException(`Department with id ${departmentId} not found`);
    }

    const leader = await this.usersRepository.findById(dto.teamLeadId);
    if (!leader) {
      throw new NotFoundException(
        `Team leader with id ${dto.teamLeadId} not found`,
      );
    }

    if (!leader.department || leader.department !== department.name) {
      throw new BadRequestException(
        'Team leader must be assigned to the same department as the sub-module',
      );
    }

    return this.departmentsRepository.createModule({
      departmentId,
      name: dto.name,
      description: dto.description,
      teamLeadId: dto.teamLeadId,
    });
  }
}
