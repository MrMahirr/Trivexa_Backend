import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionsRepository } from '../../infrastructure/repositories/permission.repository';
import { RolesRepository } from '../../infrastructure/repositories/role.repository';
import { AssignPermissionsDto } from '../../api/dto/assign-permissions.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class AssignPermissionsUseCase {
  constructor(
    private readonly rolesRepo: RolesRepository,
    private readonly permissionsRepo: PermissionsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: AssignPermissionsDto, currentUserId?: string) {
    const role = await this.rolesRepo.findById(dto.roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${dto.roleId} not found`);
    }

    await this.permissionsRepo.assignPermissions(dto.roleId, dto.permissionIds);

    this.eventEmitter.emit(SystemEvents.ROLE_PERMISSIONS_CHANGED, {
      roleId: dto.roleId,
      permissionIds: dto.permissionIds,
    });

    this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
      entityName: 'ROLE',
      entityId: dto.roleId,
      action: 'UPDATE',
      userId: currentUserId,
      details: {
        action: 'ASSIGN_PERMISSIONS',
        assignedCount: dto.permissionIds.length,
      },
    });
  }
}
