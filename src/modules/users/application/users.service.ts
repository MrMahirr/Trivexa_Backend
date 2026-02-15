import { Injectable, Logger } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { PasswordService } from '../../auth/application/password.service';
import { CreateUserDto } from '../api/dto/create-user.dto';
import { UpdateUserDto } from '../api/dto/update-user.dto';
import { UserQueryDto } from '../api/dto/user-query.dto';
import { User } from '../domain/user.entity';
import {
    UserNotFoundException,
    UserAlreadyExistsException,
    CannotDeactivateSelfException,
    CannotChangeOwnRoleException,
} from '../domain/user.errors';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly usersRepo: UsersRepository,
        private readonly passwordService: PasswordService,
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
        // Check email uniqueness
        const existing = await this.usersRepo.findByEmail(dto.email);
        if (existing) throw new UserAlreadyExistsException();

        // Hash password
        const passwordHash = await this.passwordService.hash(dto.password);

        const user = await this.usersRepo.create({
            email: dto.email,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: dto.role,
            department: dto.department,
        });

        this.logger.log(`User created: ${user.email} (${user.role})`);
        return User.toSafeResponse(user);
    }

    async update(id: string, dto: UpdateUserDto, currentUserId: string) {
        // Check if user exists
        const user = await this.usersRepo.findById(id);
        if (!user) throw new UserNotFoundException();

        // Self-update rule: cannot change own role
        if (id === currentUserId && dto.role && dto.role !== user.role) {
            throw new CannotChangeOwnRoleException();
        }

        // Check email uniqueness if email is being changed
        if (dto.email && dto.email !== user.email) {
            const existing = await this.usersRepo.findByEmail(dto.email);
            if (existing) throw new UserAlreadyExistsException();
        }

        // If password is provided, hash it and update separately
        if (dto.password) {
            const passwordHash = await this.passwordService.hash(dto.password);
            await this.usersRepo.updatePassword(id, passwordHash);
        }

        const updateData: any = {};
        if (dto.email) updateData.email = dto.email;
        if (dto.firstName) updateData.firstName = dto.firstName;
        if (dto.lastName) updateData.lastName = dto.lastName;
        if (dto.role) updateData.role = dto.role;
        if (dto.department) updateData.department = dto.department;

        const updated = await this.usersRepo.update(id, updateData);
        this.logger.log(`User updated: ${id}`);
        return User.toSafeResponse(updated!);
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
