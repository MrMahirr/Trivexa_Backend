import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUseCase } from './register.usecase';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PasswordService } from '../password.service';
import { AuthRules } from '../../domain/rules/auth.rules';
import { CreateUserDto } from '../../../users/api/dto/create-user.dto';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let usersRepo: Partial<jest.Mocked<UsersRepository>>;
  let passwordService: Partial<jest.Mocked<PasswordService>>;
  let authRules: Partial<jest.Mocked<AuthRules>>;

  beforeEach(async () => {
    usersRepo = {
      create: jest.fn(),
    };
    passwordService = {
      hash: jest.fn(),
    };
    authRules = {
      ensureEmailIsUnique: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        { provide: UsersRepository, useValue: usersRepo },
        { provide: PasswordService, useValue: passwordService },
        { provide: AuthRules, useValue: authRules },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should successfully register a user', async () => {
    const dto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'MEMBER' as any,
      department: 'IT' as any,
    };

    const hashedPassword = 'hashed_password';
    const createdUser: any = {
      id: '1',
      ...dto,
      passwordHash: hashedPassword,
      role: 'MEMBER',
      isActive: true,
      forcePasswordChange: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    authRules.ensureEmailIsUnique.mockResolvedValue(undefined);
    passwordService.hash.mockResolvedValue(hashedPassword);
    usersRepo.create.mockResolvedValue(createdUser);

    const result = await useCase.execute(dto);

    expect(authRules.ensureEmailIsUnique).toHaveBeenCalledWith(dto.email);
    expect(passwordService.hash).toHaveBeenCalledWith(dto.password);
    expect(usersRepo.create).toHaveBeenCalledWith({
      email: dto.email,
      passwordHash: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: 'MEMBER',
      department: dto.department,
    });

    expect(result).toEqual({
      id: createdUser.id,
      email: createdUser.email,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      role: createdUser.role,
    });
  });

  it('should throw error if email is not unique', async () => {
    const dto: CreateUserDto = {
      email: 'existing@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'MEMBER' as any,
      department: 'IT' as any,
    };

    const expectedError = new Error('Email already exists');
    authRules.ensureEmailIsUnique.mockRejectedValue(expectedError);

    await expect(useCase.execute(dto)).rejects.toThrow(expectedError);
    expect(usersRepo.create).not.toHaveBeenCalled();
  });
});
