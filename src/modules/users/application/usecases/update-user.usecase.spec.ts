import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase } from './update-user.usecase';
import { UsersRepository } from '../../infrastructure/users.repository';
import { PasswordService } from '../../../auth/application/password.service';
import { UpdateUserDto } from '../../api/dto/update-user.dto';
import { User } from '../../domain/user.entity';
import { Role } from '../../../../shared/enums/role.enum';
import { Department } from '../../../../shared/enums/department.enum';
import {
  UserNotFoundException,
  CannotChangeOwnRoleException,
  UserAlreadyExistsException,
} from '../../domain/user.errors';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let usersRepo: Partial<UsersRepository>;
  let passwordService: Partial<PasswordService>;

  beforeEach(async () => {
    usersRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      updatePassword: jest.fn(),
      update: jest.fn(),
    };
    passwordService = {
      hash: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        { provide: UsersRepository, useValue: usersRepo },
        { provide: PasswordService, useValue: passwordService },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = 'user-uuid';
    const currentUserId = 'admin-uuid';

    const existingUser = new User(
      userId,
      'test@example.com',
      'Old',
      'Name',
      Role.MEMBER,
      Department.DEVELOPMENT,
      true,
      false,
      new Date(),
      new Date(),
    );

    const dto: UpdateUserDto = {
      firstName: 'New',
      lastName: 'Name',
      department: Department.DESIGN,
    };

    const updatedUser = new User(
      userId,
      existingUser.email,
      dto.firstName,
      dto.lastName,
      existingUser.role,
      dto.department,
      existingUser.isActive,
      existingUser.forcePasswordChange,
      existingUser.createdAt,
      new Date(),
    );

    it('should successfully update a user', async () => {
      (usersRepo.findById as jest.Mock).mockResolvedValue(existingUser);
      (usersRepo.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await useCase.execute(userId, dto, currentUserId);

      expect(usersRepo.findById).toHaveBeenCalledWith(userId);
      // UpdateUserUseCase maps camelCase DTO to snake_case for Repo
      expect(usersRepo.update).toHaveBeenCalledWith(userId, {
        firstName: dto.firstName,
        lastName: dto.lastName,
        department: dto.department,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw UserNotFoundException if user does not exist', async () => {
      (usersRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(useCase.execute(userId, dto, currentUserId)).rejects.toThrow(
        UserNotFoundException,
      );
    });

    it('should throw CannotChangeOwnRoleException if user tries to change their own role', async () => {
      const myId = 'my-uuid';
      const me = new User(
        myId,
        'me@example.com',
        'Me',
        'Me',
        Role.ADMIN,
        null,
        true,
        false,
        new Date(),
        new Date(),
      );

      (usersRepo.findById as jest.Mock).mockResolvedValue(me);

      const roleChangeDto: UpdateUserDto = { role: Role.MEMBER };

      await expect(useCase.execute(myId, roleChangeDto, myId)).rejects.toThrow(
        CannotChangeOwnRoleException,
      );
    });

    it('should throw UserAlreadyExistsException if new email is taken', async () => {
      (usersRepo.findById as jest.Mock).mockResolvedValue(existingUser);
      (usersRepo.findByEmail as jest.Mock).mockResolvedValue({
        id: 'other-user',
      });

      const emailChangeDto: UpdateUserDto = { email: 'taken@example.com' };

      await expect(
        useCase.execute(userId, emailChangeDto, currentUserId),
      ).rejects.toThrow(UserAlreadyExistsException);
    });

    it('should hash password and update it if provided', async () => {
      (usersRepo.findById as jest.Mock).mockResolvedValue(existingUser);
      (usersRepo.update as jest.Mock).mockResolvedValue(existingUser); // return same user for simplicity
      (passwordService.hash as jest.Mock).mockResolvedValue(
        'new-hashed-password',
      );

      const passwordDto: UpdateUserDto = { password: 'NewPassword123' };

      await useCase.execute(userId, passwordDto, currentUserId);

      expect(passwordService.hash).toHaveBeenCalledWith(passwordDto.password);
      expect(usersRepo.updatePassword).toHaveBeenCalledWith(
        userId,
        'new-hashed-password',
      );
    });
  });
});
