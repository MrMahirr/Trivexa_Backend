import { Injectable } from '@nestjs/common';
import { Department } from '../../../../shared/enums/department.enum';
import { DepartmentEntity } from '../../domain/entities/department.entity';

@Injectable()
export class DepartmentsRepository {
  async findAll(): Promise<DepartmentEntity[]> {
    return Object.values(Department).map((dept) =>
      DepartmentEntity.fromEnum(dept),
    );
  }

  async findById(id: string): Promise<DepartmentEntity | null> {
    if (!Object.values(Department).includes(id as Department)) {
      return null;
    }
    return DepartmentEntity.fromEnum(id as Department);
  }
}
