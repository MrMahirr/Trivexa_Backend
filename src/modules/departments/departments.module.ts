import { Module } from '@nestjs/common';
import { DepartmentsController } from './api/departments.controller';
import { DepartmentsRepository } from './infrastructure/repositories/department.repository';
import { GetDepartmentsUseCase } from './application/usecases/get-departments.usecase';
import { CreateDepartmentUseCase } from './application/usecases/create-department.usecase';
import { UpdateDepartmentUseCase } from './application/usecases/update-department.usecase';

@Module({
  controllers: [DepartmentsController],
  providers: [
    DepartmentsRepository,
    GetDepartmentsUseCase,
    CreateDepartmentUseCase,
    UpdateDepartmentUseCase
  ],
  exports: [DepartmentsRepository],
})
export class DepartmentsModule { }
