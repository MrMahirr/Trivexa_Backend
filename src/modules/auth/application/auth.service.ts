import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../users/api/dto/create-user.dto';
import { LoginUseCase } from './usecases/login.usecase';
import { RegisterUseCase } from './usecases/register.usecase';
import { RefreshUseCase } from './usecases/refresh.usecase';
import { LogoutUseCase } from './usecases/logout.usecase';
import { ChangePasswordUseCase } from './usecases/change-password.usecase';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  async login(email: string, password: string) {
    return this.loginUseCase.execute(email, password);
  }

  async register(dto: CreateUserDto) {
    return this.registerUseCase.execute(dto);
  }

  async refresh(refreshToken: string) {
    return this.refreshUseCase.execute(refreshToken);
  }

  async logout(refreshToken: string) {
    return this.logoutUseCase.execute(refreshToken);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    return this.changePasswordUseCase.execute(userId, oldPassword, newPassword);
  }
}
