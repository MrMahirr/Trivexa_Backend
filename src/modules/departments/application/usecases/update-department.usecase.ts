import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateDepartmentDto } from '../../api/dto/update-department.dto';
import { DepartmentsRepository } from '../../infrastructure/repositories/department.repository';
import { DepartmentEntity } from '../../domain/entities/department.entity';

@Injectable()
export class UpdateDepartmentUseCase {
    constructor(private readonly departmentsRepository: DepartmentsRepository) { }

    async execute(id: string, dto: UpdateDepartmentDto): Promise<DepartmentEntity> {
        const existingDepartment = await this.departmentsRepository.findById(id);
        if (!existingDepartment) {
            throw new NotFoundException(`ID'si '${id}' olan departman bulunamadı.`);
        }

        return this.departmentsRepository.update(id, dto);
    }
}
