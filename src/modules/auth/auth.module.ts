import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from '../../config/jwt.config';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { PasswordService } from './application/password.service';
import { RefreshTokenRepository } from './infrastructure/refresh-token.repository';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { LoginUseCase } from './application/usecases/login.usecase';
import { RegisterUseCase } from './application/usecases/register.usecase';
import { RefreshUseCase } from './application/usecases/refresh.usecase';
import { LogoutUseCase } from './application/usecases/logout.usecase';
import { ChangePasswordUseCase } from './application/usecases/change-password.usecase';
import { AuthRules } from './domain/rules/auth.rules';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        ConfigModule.forFeature(jwtConfig),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('jwt.accessSecret'),
                signOptions: {
                    expiresIn: configService.get('jwt.accessExpiration', '15m'),
                },
            }),
        }),
        forwardRef(() => UsersModule), // Import UsersModule to access UsersRepository
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        PasswordService,
        RefreshTokenRepository,
        JwtStrategy,
        LoginUseCase,
        RegisterUseCase,
        RefreshUseCase,
        LogoutUseCase,
        ChangePasswordUseCase,
        AuthRules,
    ],
    exports: [
        AuthService,
        PasswordService,
        JwtStrategy,
        LoginUseCase,
        RegisterUseCase,
        RefreshUseCase,
        LogoutUseCase,
        ChangePasswordUseCase,
        AuthRules,
    ],
})
export class AuthModule { }
