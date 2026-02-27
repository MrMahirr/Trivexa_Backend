import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateDepartmentDto } from '../../api/dto/create-department.dto';
import { DepartmentsRepository } from '../../infrastructure/repositories/department.repository';
import { DepartmentEntity } from '../../domain/entities/department.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateDepartmentUseCase {
    constructor(private readonly departmentsRepository: DepartmentsRepository) { }

    async execute(dto: CreateDepartmentDto): Promise<DepartmentEntity> {
        const payload = {
            id: randomUUID(),
            name: dto.name,
            description: dto.description,
            managerId: dto.managerId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return this.departmentsRepository.create(payload);
    }
}
