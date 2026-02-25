import { Module } from '@nestjs/common';
import { RolesController } from './api/roles.controller';
import { RolesRepository } from './infrastructure/repositories/role.repository';
import { PermissionsRepository } from './infrastructure/repositories/permission.repository';
import { GetRolesUseCase } from './application/usecases/get-roles.usecase';
import { GetPermissionsUseCase } from './application/usecases/get-permissions.usecase';
import { CreateRoleUseCase } from './application/usecases/create-role.usecase';
import { UpdateRoleUseCase } from './application/usecases/update-role.usecase';
import { AssignPermissionsUseCase } from './application/usecases/assign-permissions.usecase';

@Module({
  controllers: [RolesController],
  providers: [
    RolesRepository,
    PermissionsRepository,
    GetRolesUseCase,
    GetPermissionsUseCase,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    AssignPermissionsUseCase,
  ],
  exports: [
    RolesRepository,
    PermissionsRepository,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    AssignPermissionsUseCase,
  ],
})
export class RolesModule { }
