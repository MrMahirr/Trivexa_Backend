import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { ChangeDepartmentDto } from '../../api/dto/change-department.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class ChangeDepartmentUseCase {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: ChangeDepartmentDto, adminId?: string): Promise<void> {
    const user = await this.usersRepo.findById(dto.userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    const oldDept = user.department;
    await this.usersRepo.update(dto.userId, { department: dto.department });

    // Emit event for Audit Log
    this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
      entityName: 'USER',
      entityId: dto.userId,
      action: 'UPDATE',
      userId: adminId,
      details: {
        action: 'CHANGE_DEPARTMENT',
        oldDepartment: oldDept,
        newDepartment: dto.department,
      },
    });
  }
}
