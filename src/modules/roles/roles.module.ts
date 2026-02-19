import { Module } from '@nestjs/common';
import { RolesController } from './api/roles.controller';
import { RolesRepository } from './infrastructure/repositories/role.repository';
import { PermissionsRepository } from './infrastructure/repositories/permission.repository';
import { GetRolesUseCase } from './application/usecases/get-roles.usecase';
import { GetPermissionsUseCase } from './application/usecases/get-permissions.usecase';

@Module({
    controllers: [RolesController],
    providers: [
        RolesRepository,
        PermissionsRepository,
        GetRolesUseCase,
        GetPermissionsUseCase,
    ],
    exports: [RolesRepository, PermissionsRepository],
})
export class RolesModule { }
