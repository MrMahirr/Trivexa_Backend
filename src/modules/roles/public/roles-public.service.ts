import { Injectable } from '@nestjs/common';
import { RolesRepository } from '../infrastructure/repositories/role.repository';
import { PermissionsRepository } from '../infrastructure/repositories/permission.repository';
import { RoleEntity } from '../domain/entities/role.entity';
import { PermissionEntity } from '../domain/entities/permission.entity';

@Injectable()
export class RolesPublicService {
  constructor(
    private readonly rolesRepo: RolesRepository,
    private readonly permissionsRepo: PermissionsRepository,
  ) {}

  async getAllRoles(): Promise<RoleEntity[]> {
    return this.rolesRepo.findAll();
  }

  async getRoleById(id: string): Promise<RoleEntity | null> {
    return this.rolesRepo.findById(id);
  }

  async getPermissionsByRoleId(roleId: string): Promise<PermissionEntity[]> {
    return this.permissionsRepo.findByRoleId(roleId);
  }

  async getAllPermissions(): Promise<PermissionEntity[]> {
    return this.permissionsRepo.findAll();
  }
}
