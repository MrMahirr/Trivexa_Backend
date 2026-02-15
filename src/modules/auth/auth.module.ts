import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from '../../config/jwt.config';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { PasswordService } from './application/password.service';
import { RefreshTokenRepository } from './infrastructure/refresh-token.repository';
import { JwtStrategy } from './infrastructure/jwt.strategy';

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
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        PasswordService,
        RefreshTokenRepository,
        JwtStrategy,
    ],
    exports: [AuthService, PasswordService, JwtStrategy],
})
export class AuthModule { }
