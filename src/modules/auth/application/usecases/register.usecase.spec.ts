import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUseCase } from './register.usecase';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PasswordService } from '../password.service';
import { AuthRules } from '../../domain/rules/auth.rules';
import { CreateUserDto } from '../../../users/api/dto/create-user.dto';
import { ConflictException } from '@nestjs/common';
import { Department } from '../../../../shared/enums/department.enum';
import { Role } from '../../../../shared/enums/role.enum';

describe('RegisterUseCase', () => {
    let useCase: RegisterUseCase;
    let usersRepo: Partial<UsersRepository>;
    let passwordService: Partial<PasswordService>;
    let authRules: Partial<AuthRules>;

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

    describe('execute', () => {
        const dto: CreateUserDto = {
            email: 'newuser@example.com',
            password: 'password123',
            firstName: 'Jane',
            lastName: 'Doe',
            department: Department.MARKETING,
            role: Role.MEMBER,
        };

        const createdUser = {
            id: 'new-user-id',
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: dto.role || 'USER',
            department: dto.department,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should successfully register a new user', async () => {
            (authRules.ensureEmailIsUnique as jest.Mock).mockResolvedValue(undefined);
            (passwordService.hash as jest.Mock).mockResolvedValue('hashed-password');
            (usersRepo.create as jest.Mock).mockResolvedValue(createdUser);

            const result = await useCase.execute(dto);

            expect(authRules.ensureEmailIsUnique).toHaveBeenCalledWith(dto.email);
            expect(passwordService.hash).toHaveBeenCalledWith(dto.password);
            expect(usersRepo.create).toHaveBeenCalledWith({
                email: dto.email,
                passwordHash: 'hashed-password',
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.role,
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

        it('should throw ConflictException if email already exists', async () => {
            (authRules.ensureEmailIsUnique as jest.Mock).mockRejectedValue(new ConflictException('Email already exists'));

            await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
            expect(usersRepo.create).not.toHaveBeenCalled();
        });
    });
});
