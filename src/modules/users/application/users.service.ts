import { Injectable, Logger } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
// PasswordService is no longer needed here as UseCases handle hashing
// import { PasswordService } from '../../auth/application/password.service'; 
import { CreateUserDto } from '../api/dto/create-user.dto';
import { UpdateUserDto } from '../api/dto/update-user.dto';
import { UserQueryDto } from '../api/dto/user-query.dto';
import { User } from '../domain/user.entity';
import {
    UserNotFoundException,
    CannotDeactivateSelfException,
} from '../domain/user.errors';
import { CreateUserUseCase } from './usecases/create-user.usecase';
import { UpdateUserUseCase } from './usecases/update-user.usecase';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly usersRepo: UsersRepository,
        // private readonly passwordService: PasswordService,
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
    ) { }

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
            data: data.map(User.toSafeResponse),
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
        const updatedUser = await this.updateUserUseCase.execute(id, dto, currentUserId);
        return User.toSafeResponse(updatedUser);
    }

    async deactivate(id: string, currentUserId: string) {
        if (id === currentUserId) {
            throw new CannotDeactivateSelfException();
        }

        const user = await this.usersRepo.findById(id);
        if (!user) throw new UserNotFoundException();

        const deactivated = await this.usersRepo.deactivate(id);
        this.logger.log(`User deactivated: ${id}`);
        return User.toSafeResponse(deactivated!);
    }
}
