import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import * as bcrypt from 'bcrypt';
import { ForceChangePasswordDto } from '../../api/dto/force-change-password.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class ForceChangePasswordUseCase {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async execute(dto: ForceChangePasswordDto, adminId?: string): Promise<void> {
        const user = await this.usersRepository.findById(dto.userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${dto.userId} not found`);
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

        await this.usersRepository.updatePassword(dto.userId, hashedPassword);

        this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
            entityName: 'USER',
            entityId: dto.userId,
            action: 'UPDATE',
            userId: adminId,
            details: { message: 'Password forcefully changed by admin' },
        });
    }
}
