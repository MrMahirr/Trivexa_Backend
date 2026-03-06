import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from '../api/dto/create-user.dto';
import { UpdateUserDto } from '../api/dto/update-user.dto';
import { UserQueryDto } from '../api/dto/user-query.dto';
import { User } from '../domain/user.entity';
import { UserNotFoundException } from '../domain/user.errors';
import { CreateUserUseCase } from './usecases/create-user.usecase';
import { UpdateUserUseCase } from './usecases/update-user.usecase';
import { DeactivateUserUseCase } from './usecases/deactivate-user.usecase';
import { ActivateUserUseCase } from './usecases/activate-user.usecase';
import { ChangeDepartmentUseCase } from './usecases/change-department.usecase';
import { ChangeRoleUseCase } from './usecases/change-role.usecase';
import { ExportUsersUseCase } from './usecases/export-users.usecase';
import { ChangeDepartmentDto } from '../api/dto/change-department.dto';
import { ChangeRoleDto } from '../api/dto/change-role.dto';
import { ExportUsersQueryDto } from '../api/dto/export-users.query';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly changeDepartmentUseCase: ChangeDepartmentUseCase,
    private readonly changeRoleUseCase: ChangeRoleUseCase,
    private readonly exportUsersUseCase: ExportUsersUseCase,
  ) {}

  async findAll(query: UserQueryDto) {
    const { data, total } = await this.usersRepo.findAll({
      page: query.page || 1,
      limit: query.limit || 20,
      role: query.role,
      department: query.department,
      isActive: query.isActive,
      search: query.search,
    });

    return {
      data: data.map((user) => User.toSafeResponse(user)),
      meta: {
        total,
        page: query.page || 1,
        limit: query.limit || 20,
        totalPages: Math.ceil(total / (query.limit || 20)),
      },
    };
  }

  async findById(id: string) {
    const user = await this.usersRepo.findById(id);
    if (!user) throw new UserNotFoundException();
    return User.toSafeResponse(user);
  }

  async create(dto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(dto);
    return User.toSafeResponse(user);
  }

  async update(id: string, dto: UpdateUserDto, currentUserId: string) {
    const updatedUser = await this.updateUserUseCase.execute(
      id,
      dto,
      currentUserId,
    );
    return User.toSafeResponse(updatedUser);
  }

  async deactivate(id: string, currentUserId: string) {
    const deactivated = await this.deactivateUserUseCase.execute(
      id,
      currentUserId,
    );
    return User.toSafeResponse(deactivated);
  }

  async activate(id: string) {
    const activated = await this.activateUserUseCase.execute(id);
    return User.toSafeResponse(activated);
  }

  async changeDepartment(dto: ChangeDepartmentDto, adminId?: string) {
    return this.changeDepartmentUseCase.execute(dto, adminId);
  }

  async changeRole(targetUserId: string, dto: ChangeRoleDto) {
    const user = await this.changeRoleUseCase.execute(targetUserId, dto);
    return User.toSafeResponse(user);
  }

  async exportUsers(query: ExportUsersQueryDto) {
    return this.exportUsersUseCase.execute(query);
  }
}
