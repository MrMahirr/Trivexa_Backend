import { Injectable } from '@nestjs/common';

import { ChangeRoleDto } from '../../api/dto/change-role.dto';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UserEntity } from '../../domain/user.entity';
import { NotFoundError } from "../../../../shared/errors/not-found.error";

@Injectable()
export class ChangeRoleUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(targetUserId: string, dto: ChangeRoleDto): Promise<UserEntity> {
    const existingUser = await this.usersRepository.findById(targetUserId);
    if (!existingUser) {
      throw new NotFoundError(
        `Rolü değiştirilecek kullanıcı (${targetUserId}) bulunamadı.`,
      );
    }

    // Attempt to update the user's role
    const updatedUser = await this.usersRepository.update(targetUserId, {
      role: dto.role,
    });

    if (!updatedUser) {
      throw new NotFoundError('Kullanıcı güncellenirken bir sorun oluştu.');
    }

    return updatedUser;
  }
}
