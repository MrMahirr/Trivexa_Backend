import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../users/users.module';
import { DepartmentsController } from './api/departments.controller';
import { DepartmentsRepository } from './infrastructure/repositories/department.repository';
import { GetDepartmentsUseCase } from './application/usecases/get-departments.usecase';
import { CreateDepartmentUseCase } from './application/usecases/create-department.usecase';
import { UpdateDepartmentUseCase } from './application/usecases/update-department.usecase';
import { CreateDepartmentModuleUseCase } from './application/usecases/create-department-module.usecase';
import { UpdateDepartmentModuleUseCase } from './application/usecases/update-department-module.usecase';
import { DeleteDepartmentModuleUseCase } from './application/usecases/delete-department-module.usecase';
import { DepartmentsPublicService } from './public/departments-public.service';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [DepartmentsController],
  providers: [
    DepartmentsRepository,
    GetDepartmentsUseCase,
    CreateDepartmentUseCase,
    UpdateDepartmentUseCase,
    CreateDepartmentModuleUseCase,
    UpdateDepartmentModuleUseCase,
    DeleteDepartmentModuleUseCase,
    DepartmentsPublicService,
  ],
  exports: [DepartmentsRepository, DepartmentsPublicService],
})
export class DepartmentsModule {}
