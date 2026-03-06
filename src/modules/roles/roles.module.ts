import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { RolesController } from './api/roles.controller';
import { RolesRepository } from './infrastructure/repositories/role.repository';
import { PermissionsRepository } from './infrastructure/repositories/permission.repository';
import { GetRolesUseCase } from './application/usecases/get-roles.usecase';
import { GetPermissionsUseCase } from './application/usecases/get-permissions.usecase';
import { CreateRoleUseCase } from './application/usecases/create-role.usecase';
import { UpdateRoleUseCase } from './application/usecases/update-role.usecase';
import { AssignPermissionsUseCase } from './application/usecases/assign-permissions.usecase';
import { DeleteRoleUseCase } from './application/usecases/delete-role.usecase';
import { RolesPublicService } from './public/roles-public.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RolesController],
  providers: [
    RolesRepository,
    PermissionsRepository,
    GetRolesUseCase,
    GetPermissionsUseCase,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    AssignPermissionsUseCase,
    DeleteRoleUseCase,
    RolesPublicService,
  ],
  exports: [
    RolesRepository,
    PermissionsRepository,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    AssignPermissionsUseCase,
    DeleteRoleUseCase,
    RolesPublicService,
  ],
})
export class RolesModule {}
