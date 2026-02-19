import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from './login.usecase';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PasswordService } from '../password.service';
import { RefreshTokenRepository } from '../../infrastructure/refresh-token.repository';
import jwtConfig from '../../../../config/jwt.config';
import { InvalidCredentialsException, AccountDeactivatedException } from '../../domain/auth.errors';

describe('LoginUseCase', () => {
    let useCase: LoginUseCase;
    let usersRepo: Partial<UsersRepository>;
    let passwordService: Partial<PasswordService>;
    let refreshTokenRepo: Partial<RefreshTokenRepository>;
    let jwtService: Partial<JwtService>;

    const mockJwtConfig = {
        secret: 'test-secret',
        accessSecret: 'access-secret',
        refreshSecret: 'refresh-secret',
        accessExpiration: '1h',
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

    describe('execute', () => {
        const email = 'test@example.com';
        const password = 'password123';
        const user = {
            id: 'user-id',
            email,
            password_hash: 'hashed-password',
            first_name: 'John',
            last_name: 'Doe',
            role: 'MEMBER',
            department: 'IT',
            is_active: true,
            force_password_change: false,
        };

        it('should return tokens and user info on valid login', async () => {
            (usersRepo.findByEmail as jest.Mock).mockResolvedValue(user);
            (passwordService.compare as jest.Mock).mockResolvedValue(true);
            (jwtService.signAsync as jest.Mock)
                .mockResolvedValueOnce('access-token')
                .mockResolvedValueOnce('refresh-token');

            const result = await useCase.execute(email, password);

            expect(result).toHaveProperty('accessToken', 'access-token');
            expect(result).toHaveProperty('refreshToken', 'refresh-token');
            expect(result.user).toEqual({
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                department: user.department,
                forcePasswordChange: user.force_password_change,
            });
            expect(refreshTokenRepo.create).toHaveBeenCalled();
        });

        it('should throw InvalidCredentialsException if user not found', async () => {
            (usersRepo.findByEmail as jest.Mock).mockResolvedValue(null);

            await expect(useCase.execute(email, password)).rejects.toThrow(InvalidCredentialsException);
        });

        it('should throw AccountDeactivatedException if user is inactive', async () => {
            (usersRepo.findByEmail as jest.Mock).mockResolvedValue({ ...user, is_active: false });

            await expect(useCase.execute(email, password)).rejects.toThrow(AccountDeactivatedException);
        });

        it('should throw InvalidCredentialsException if password does not match', async () => {
            (usersRepo.findByEmail as jest.Mock).mockResolvedValue(user);
            (passwordService.compare as jest.Mock).mockResolvedValue(false);

            await expect(useCase.execute(email, password)).rejects.toThrow(InvalidCredentialsException);
        });
    });
});
