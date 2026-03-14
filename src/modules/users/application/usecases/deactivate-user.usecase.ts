import { Injectable, Logger } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error';

import { UsersRepository } from '../../infrastructure/users.repository';
import { User } from '../../domain/user.entity';
import {
  CannotDeactivateSelfException,
  UserNotFoundException } from '../../domain/user.errors';

@Injectable()
export class DeactivateUserUseCase {
  private readonly logger = new Logger(DeactivateUserUseCase.name);

  constructor(private readonly usersRepo: UsersRepository) {}

  async execute(id: string, currentUserId: string): Promise<User> {
    // 1. Self-deactivation check
    if (id === currentUserId) {
      throw new CannotDeactivateSelfException();
    }

    // 2. Check if user exists
    const user = await this.usersRepo.findById(id);
    if (!user) throw new UserNotFoundException();

    // 3. Deactivate
    const deactivated = await this.usersRepo.deactivate(id);
    this.logger.log(`User deactivated: ${id}`);

    return deactivated instanceof User
      ? deactivated
      : User.fromRow(deactivated);
  }
}
