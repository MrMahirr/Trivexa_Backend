import { Injectable, Logger } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { PasswordService } from '../../../auth/application/password.service';
import { AuthRules } from '../../../auth/domain/rules/auth.rules';
import { CreateUserDto } from '../../api/dto/create-user.dto';
import { User } from '../../domain/user.entity';

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly passwordService: PasswordService,
    private readonly authRules: AuthRules,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // 1. Validate rules
    await this.authRules.ensureEmailIsUnique(dto.email);

    // 2. Hash password
    const passwordHash = await this.passwordService.hash(dto.password);

    // 3. Create user
    // Note: UsersRepository.create returns UserEntity (interface),
    // but we updated UserEntity file to have a class User that implements it.
    // We should ensure repository returns the class instance or we perform conversion here.
    // For now, assuming repository returns an object compatible with UserEntity interface.
    // We can cast it or wrap it if needed.
    // Best practice: The Repository should ideally return the Domain Entity Class.
    // But for now, we trust the interface contract.
    const user = await this.usersRepo.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      department: dto.department,
    });

    this.logger.log(`User created: ${user.email} (${user.role})`);

    // Return domain entity (or interface compliant object)
    return user instanceof User ? user : User.fromRow(user);
    // We might need to map it if the Repo returns just a plain object matching the interface but not the methods.
    // Actually User.fromRow expects a DB row structure (snake_case), but Repo return value might be camelCase (Mapped).
    // Let's check UsersRepository.create return value.
    // It returns `User.fromRow(row)`. User.fromRow returns a `User` instance (because I updated it!).
    // So `user` IS a `User` instance.
  }
}
