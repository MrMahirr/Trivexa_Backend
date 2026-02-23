import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.usecase';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PasswordService } from '../password.service';
import { RefreshTokenRepository } from '../../infrastructure/refresh-token.repository';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../../../config/jwt.config';
import {
  InvalidCredentialsException,
  AccountDeactivatedException,
} from '../../domain/auth.errors';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let usersRepo: Partial<jest.Mocked<UsersRepository>>;
  let passwordService: Partial<jest.Mocked<PasswordService>>;
  let refreshTokenRepo: Partial<jest.Mocked<RefreshTokenRepository>>;
  let jwtService: Partial<jest.Mocked<JwtService>>;

  const mockJwtConfig = {
    accessSecret: 'access-secret',
    accessExpiration: '15m',
    refreshSecret: 'refresh-secret',
    refreshExpiration: '7d',
  };

  beforeEach(async () => {
    usersRepo = {
      findByEmail: jest.fn(),
    };
    passwordService = {
      compare: jest.fn(),
    };
    refreshTokenRepo = {
      create: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: UsersRepository, useValue: usersRepo },
        { provide: PasswordService, useValue: passwordService },
        { provide: RefreshTokenRepository, useValue: refreshTokenRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: jwtConfig.KEY, useValue: mockJwtConfig },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw InvalidCredentialsException if user not found', async () => {
    usersRepo.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute('test@example.com', 'pass')).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should throw AccountDeactivatedException if user is not active', async () => {
    usersRepo.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      is_active: false,
    } as any);

    await expect(useCase.execute('test@example.com', 'pass')).rejects.toThrow(
      AccountDeactivatedException,
    );
  });

  it('should throw InvalidCredentialsException if password invalid', async () => {
    usersRepo.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      is_active: true,
      password_hash: 'hash',
    } as any);
    passwordService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute('test@example.com', 'wrongpass'),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should return tokens and user on success', async () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'USER',
      is_active: true,
      password_hash: 'hashedpass',
    };

    usersRepo.findByEmail.mockResolvedValue(user as any);
    passwordService.compare.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('token');
    refreshTokenRepo.create.mockResolvedValue(undefined);

    const result = await useCase.execute('test@example.com', 'password');

    expect(result).toEqual({
      accessToken: 'token',
      refreshToken: 'token',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        department: undefined,
        forcePasswordChange: undefined,
      },
    });
    expect(refreshTokenRepo.create).toHaveBeenCalled();
  });
});
