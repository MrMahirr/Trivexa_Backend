import {
  Injectable,
  } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Role } from '../../../../shared/enums/role.enum';
import { SystemEvents } from '../../../../shared/events/event.constants';
import { RolesRepository } from '../../infrastructure/repositories/role.repository';
import { NotFoundError } from "../../../../shared/errors/not-found.error";
import { ForbiddenError } from "../../../../shared/errors/forbidden.error";
import { ConflictError } from "../../../../shared/errors/conflict.error";

function normalizeRoleName(roleName: string): string {
  return roleName.trim().toUpperCase().replace(/\s+/g, '_');
}

@Injectable()
export class DeleteRoleUseCase {
  private readonly protectedRoles = new Set<string>(Object.values(Role));

  constructor(
    private readonly rolesRepo: RolesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(roleId: string, currentUserId?: string): Promise<void> {
    const role = await this.rolesRepo.findById(roleId);
    if (!role) {
      throw new NotFoundError(`Role with ID ${roleId} not found`);
    }

    if (this.protectedRoles.has(normalizeRoleName(role.name))) {
      throw new ForbiddenError(
        `${role.name} ana rolu silinemez. Sadece sonradan eklenen roller silinebilir.`,
      );
    }

    const activeUsageCount = await this.rolesRepo.countUsersByRoleName(
      role.name,
    );
    if (activeUsageCount > 0) {
      throw new ConflictError(
        `${role.name} rolune atali kullanicilar var. Once rol atamalarini degistirin.`,
      );
    }

    const deleted = await this.rolesRepo.deleteById(role.id);
    if (!deleted) {
      throw new NotFoundError(`Role with ID ${roleId} not found`);
    }

    this.eventEmitter.emit(SystemEvents.ROLE_DELETED, {
      roleId: role.id,
      name: role.name,
    });

    this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
      entityName: 'ROLE',
      entityId: role.id,
      action: 'DELETE',
      userId: currentUserId,
      details: { name: role.name },
    });
  }
}
