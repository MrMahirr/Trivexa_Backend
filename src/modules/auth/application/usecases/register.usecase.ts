import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PasswordService } from '../password.service';
import { AuthRules } from '../../domain/rules/auth.rules';
import { CreateUserDto } from '../../../users/api/dto/create-user.dto';

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly passwordService: PasswordService,
    private readonly authRules: AuthRules,
  ) {}

  async execute(dto: CreateUserDto) {
    // 1. Validate rules
    await this.authRules.ensureEmailIsUnique(dto.email);

    if (!dto.password) {
      throw new BadRequestException('Password is required');
    }

    // 2. Hash password
    const passwordHash = await this.passwordService.hash(dto.password);

    // 3. Create user
    const user = await this.usersRepo.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role || 'USER', // Default role if not provided
      department: dto.department,
      forcePasswordChange: false,
    });

    this.logger.log(`User registered: ${user.email}`);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
