import { Module } from '@nestjs/common';
import { DepartmentsController } from './api/departments.controller';
import { DepartmentsRepository } from './infrastructure/repositories/department.repository';
import { GetDepartmentsUseCase } from './application/usecases/get-departments.usecase';

@Module({
  controllers: [DepartmentsController],
  providers: [DepartmentsRepository, GetDepartmentsUseCase],
  exports: [DepartmentsRepository],
})
export class DepartmentsModule {}
