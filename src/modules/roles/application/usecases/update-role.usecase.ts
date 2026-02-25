import { Injectable, NotFoundException } from '@nestjs/common';
import { RolesRepository } from '../../infrastructure/repositories/role.repository';
import { UpdateRoleDto } from '../../api/dto/update-role.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class UpdateRoleUseCase {
    constructor(
        private readonly rolesRepo: RolesRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async execute(roleId: string, dto: UpdateRoleDto, currentUserId?: string) {
        const role = await this.rolesRepo.update(roleId, dto.name, dto.description);

        if (!role) {
            throw new NotFoundException(`Role with ID ${roleId} not found`);
        }

        this.eventEmitter.emit(SystemEvents.ROLE_UPDATED, {
            roleId: role.id,
            name: role.name,
        });

        this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
            entityName: 'ROLE',
            entityId: role.id,
            action: 'UPDATE',
            userId: currentUserId,
            details: { updatedFields: Object.keys(dto) },
        });

        return role;
    }
}
