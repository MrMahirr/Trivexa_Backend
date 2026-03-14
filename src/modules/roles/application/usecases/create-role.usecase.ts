import { Injectable } from '@nestjs/common';

import { RolesRepository } from '../../infrastructure/repositories/role.repository';
import { CreateRoleDto } from '../../api/dto/create-role.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';
import { ConflictError } from "../../../../shared/errors/conflict.error";

@Injectable()
export class CreateRoleUseCase {
  constructor(
    private readonly rolesRepo: RolesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateRoleDto, currentUserId?: string) {
    // Basic validation & creation
    try {
      const role = await this.rolesRepo.create(dto.name, dto.description);

      this.eventEmitter.emit(SystemEvents.ROLE_CREATED, {
        roleId: role.id,
        name: role.name,
      });

      this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
        entityName: 'ROLE',
        entityId: role.id,
        action: 'CREATE',
        userId: currentUserId,
        details: { name: dto.name },
      });

      return role;
    } catch (e: any) {
      if (e.code === '23505') {
        // Postgres unique constraint violation
        throw new ConflictError(
          `Role with name ${dto.name} already exists`,
        );
      }
      throw e;
    }
  }
}
