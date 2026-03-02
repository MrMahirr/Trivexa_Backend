import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { DepartmentsController } from './api/departments.controller';
import { DepartmentsRepository } from './infrastructure/repositories/department.repository';
import { GetDepartmentsUseCase } from './application/usecases/get-departments.usecase';
import { CreateDepartmentUseCase } from './application/usecases/create-department.usecase';
import { UpdateDepartmentUseCase } from './application/usecases/update-department.usecase';
import { DepartmentsPublicService } from './public/departments-public.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DepartmentsController],
  providers: [
    DepartmentsRepository,
    GetDepartmentsUseCase,
    CreateDepartmentUseCase,
    UpdateDepartmentUseCase,
    DepartmentsPublicService,
  ],
  exports: [DepartmentsRepository, DepartmentsPublicService],
})
export class DepartmentsModule {}
