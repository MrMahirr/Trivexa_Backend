import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.usecase';
import { UsersRepository } from '../../infrastructure/users.repository';
import { PasswordService } from '../../../auth/application/password.service';
import { AuthRules } from '../../../auth/domain/rules/auth.rules';
import { CreateUserDto } from '../../api/dto/create-user.dto';
import { User } from '../../domain/user.entity';
import { Role } from '../../../../shared/enums/role.enum';
import { Department } from '../../../../shared/enums/department.enum';
import { ConflictException } from '@nestjs/common';

describe('CreateUserUseCase', () => {
    let useCase: CreateUserUseCase;
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
                CreateUserUseCase,
                { provide: UsersRepository, useValue: usersRepo },
                { provide: PasswordService, useValue: passwordService },
                { provide: AuthRules, useValue: authRules },
            ],
        }).compile();

        useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const dto: CreateUserDto = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            role: Role.MANAGER,
            department: Department.MARKETING,
        };

        const createdUserMock = new User(
            'uuid',
            dto.email,
            dto.firstName,
            dto.lastName,
            dto.role,
            dto.department,
            true,
            false,
            new Date(),
            new Date(),
        );

        it('should successfully create a user', async () => {
            (authRules.ensureEmailIsUnique as jest.Mock).mockResolvedValue(undefined);
            (passwordService.hash as jest.Mock).mockResolvedValue('hashed_password');
            (usersRepo.create as jest.Mock).mockResolvedValue(createdUserMock);

            const result = await useCase.execute(dto);

            expect(authRules.ensureEmailIsUnique).toHaveBeenCalledWith(dto.email);
            expect(passwordService.hash).toHaveBeenCalledWith(dto.password);
            expect(usersRepo.create).toHaveBeenCalledWith({
                email: dto.email,
                passwordHash: 'hashed_password',
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.role,
                department: dto.department,
            });
            // The UseCase returns either the User instance or User.fromRow result. 
            // Since we mocked repo to return `createdUserMock` (which we cast to User), it should return that.
            expect(result).toEqual(createdUserMock);
        });

        it('should throw ConflictException if email exists', async () => {
            (authRules.ensureEmailIsUnique as jest.Mock).mockRejectedValue(new ConflictException('Email exists'));

            await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
            expect(usersRepo.create).not.toHaveBeenCalled();
        });
    });
});
