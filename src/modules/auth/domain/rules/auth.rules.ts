import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UserAlreadyExistsException } from '../../../users/domain/user.errors';

@Injectable()
export class AuthRules {
  constructor(private readonly usersRepo: UsersRepository) {}

  async ensureEmailIsUnique(email: string): Promise<void> {
    const existing = await this.usersRepo.findByEmail(email);
    if (existing) {
      throw new UserAlreadyExistsException();
    }
  }

  validatePasswordComplexity(password: string): boolean {
    // Example: At least 8 chars, 1 uppercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/;
    return passwordRegex.test(password);
  }
}
