import { Injectable, Logger } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { PasswordService } from '../../../auth/application/password.service';
import { UpdateUserDto } from '../../api/dto/update-user.dto';
import { User } from '../../domain/user.entity';
import {
  UserNotFoundException,
  UserAlreadyExistsException,
  CannotChangeOwnRoleException,
} from '../../domain/user.errors';

@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(
    id: string,
    dto: UpdateUserDto,
    currentUserId: string,
  ): Promise<User> {
    // 1. Check if user exists
    const user = await this.usersRepo.findById(id);
    if (!user) throw new UserNotFoundException();

    // 2. Self-update rule: cannot change own role
    if (
      id === currentUserId &&
      dto.role &&
      String(dto.role) !== String(user.role)
    ) {
      throw new CannotChangeOwnRoleException();
    }

    // 3. Check email uniqueness if email is being changed
    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepo.findByEmail(dto.email);
      if (existing) throw new UserAlreadyExistsException();
    }

    // 4. Handle password update separately
    if (dto.password) {
      const passwordHash = await this.passwordService.hash(dto.password);
      await this.usersRepo.updatePassword(id, passwordHash);
    }

    // 5. Transform keys and update
    // Repository expects camelCase matching the interface?
    // UsersRepository.update takes Partial<{ email, firstName, ... }>
    const updateData: any = {};
    if (dto.email) updateData.email = dto.email;
    if (dto.firstName) updateData.firstName = dto.firstName;
    if (dto.lastName) updateData.lastName = dto.lastName;
    if (dto.role) updateData.role = dto.role;
    if (dto.department) updateData.department = dto.department;

    const updated = await this.usersRepo.update(id, updateData);

    this.logger.log(`User updated: ${id}`);

    return updated instanceof User ? updated : User.fromRow(updated);
  }
}
