import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { AuthModule } from '../auth/auth.module';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { UpdateUserUseCase } from './application/usecases/update-user.usecase';
import { DeactivateUserUseCase } from './application/usecases/deactivate-user.usecase';
import { ChangeDepartmentUseCase } from './application/usecases/change-department.usecase';
import { ChangeRoleUseCase } from './application/usecases/change-role.usecase';
import { ExportUsersUseCase } from './application/usecases/export-users.usecase';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeactivateUserUseCase,
    ChangeDepartmentUseCase,
    ChangeRoleUseCase,
    ExportUsersUseCase,
  ],
  exports: [
    UsersService,
    UsersRepository,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeactivateUserUseCase,
    ChangeDepartmentUseCase,
    ChangeRoleUseCase,
    ExportUsersUseCase,
  ],
})
export class UsersModule {}
