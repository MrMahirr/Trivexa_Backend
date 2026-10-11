import { Injectable, Logger } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { User } from '../../domain/user.entity';
import { UserNotFoundException } from '../../domain/user.errors';

@Injectable()
export class ActivateUserUseCase {
  private readonly logger = new Logger(ActivateUserUseCase.name);

  constructor(private readonly usersRepo: UsersRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.usersRepo.findById(id);
    if (!user) throw new UserNotFoundException();

    const activated = await this.usersRepo.activate(id);
    if (!activated) throw new UserNotFoundException();
    this.logger.log(`User activated: ${id}`);

    return activated instanceof User ? activated : User.fromRow(activated);
  }
}
