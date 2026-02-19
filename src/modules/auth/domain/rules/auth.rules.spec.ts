import { Test, TestingModule } from '@nestjs/testing';
import { AuthRules } from './auth.rules';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UserAlreadyExistsException } from '../../../users/domain/user.errors';

describe('AuthRules', () => {
    let rules: AuthRules;
    let usersRepo: Partial<jest.Mocked<UsersRepository>>;

    beforeEach(async () => {
        usersRepo = {
            findByEmail: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthRules,
                { provide: UsersRepository, useValue: usersRepo },
            ],
        }).compile();

        rules = module.get<AuthRules>(AuthRules);
    });

    it('should be defined', () => {
        expect(rules).toBeDefined();
    });

    it('should throw UserAlreadyExistsException if email exists', async () => {
        usersRepo.findByEmail.mockResolvedValue({ id: '1' } as any);
        await expect(rules.ensureEmailIsUnique('exist@test.com')).rejects.toThrow(UserAlreadyExistsException);
    });

    it('should not throw if email is unique', async () => {
        usersRepo.findByEmail.mockResolvedValue(null);
        await expect(rules.ensureEmailIsUnique('new@test.com')).resolves.not.toThrow();
    });
});
