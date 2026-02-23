import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PasswordService } from '../password.service';
import { RefreshTokenRepository } from '../../infrastructure/refresh-token.repository';
import { AuthRules } from '../../domain/rules/auth.rules';
import { InvalidCredentialsException } from '../../domain/auth.errors';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly passwordService: PasswordService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly authRules: AuthRules,
  ) {}

  async execute(userId: string, oldPassword: string, newPassword: string) {
    // 1. Validate new password complexity
    if (!this.authRules.validatePasswordComplexity(newPassword)) {
      throw new Error('Password does not meet complexity requirements'); // Or a custom exception
    }

    // 2. Get user
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // 3. Verify old password
    // Note: findById doesn't return password_hash usually for security,
    // but we need it here. UsersRepository.findById might need adjustment or we use a specific method.
    // Actually AuthService used a direct query for this.
    // Let's rely on UsersRepository having a method or query for this.
    // Looking at UsersRepository, findById returns UserEntity which DOES NOT have password_hash.
    // findByEmail DOES calculate it but likely returns a raw object or similar.
    // Let's check UsersRepository again to be sure.

    // Strategy: Use findByEmail or add findByIdWithPassword to Repository.
    // But better: Use UsersRepository.findByEmail if we had email. We have userId.
    // So we might need to extend UsersRepository or use a direct query via a new method.
    // For now, I will assume UsersRepository needs a method `findByIdForAuth` or similar.
    // OPTION: AuthService used `SELECT id, password_hash FROM users WHERE id = $1`.
    // I should add `findByIdPrevileged` or `findPasswordHashById` to UsersRepository.

    // Wait, I can't easily change UsersRepository without Context switch.
    // But I should. It's part of the refactor.
    // Let's add `findPasswordHashById` to UsersRepository first.

    // ...Wait, let's write the UseCase assuming `findPasswordHashById` exists,
    // and then I will update UsersRepository.

    const userHash = await this.usersRepo.findPasswordHashById(userId);
    if (!userHash) {
      throw new InvalidCredentialsException();
    }

    const isOldValid = await this.passwordService.compare(
      oldPassword,
      userHash,
    );
    if (!isOldValid) {
      throw new InvalidCredentialsException();
    }

    // 4. Hash new password
    const newHash = await this.passwordService.hash(newPassword);

    // 5. Update password
    await this.usersRepo.updatePassword(userId, newHash);

    // 6. Revoke all refresh tokens
    await this.refreshTokenRepo.revokeByUserId(userId);

    return { message: 'Password changed successfully' };
  }
}
