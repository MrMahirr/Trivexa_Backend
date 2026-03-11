import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../../../../shared/enums/role.enum';
import { ClientsRepository } from '../../infrastructure/clients.repository';
import { ClientUsersRepository } from '../../infrastructure/client-users.repository';

@Injectable()
export class ClientPortalLoginUseCase {
  constructor(
    private readonly clientUsersRepo: ClientUsersRepository,
    private readonly clientsRepo: ClientsRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(email: string, password: string) {
    const clientUser = await this.clientUsersRepo.findByEmail(email);
    if (!clientUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      clientUser.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const client = await this.clientsRepo.findById(clientUser.clientId);
    if (!client || !client.isActive) {
      throw new UnauthorizedException('Client account is inactive');
    }

    const accessSecret = this.configService.get<string>('jwt.accessSecret');
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const accessExpiration =
      this.configService.get<string>('jwt.accessExpiration') || '15m';
    const refreshExpiration =
      this.configService.get<string>('jwt.refreshExpiration') || '7d';

    const contactPerson = (client.contactPerson || '').trim();
    const [firstName = '', ...rest] = contactPerson
      .split(/\s+/)
      .filter(Boolean);
    const lastName = rest.join(' ');

    const payload = {
      sub: clientUser.id,
      email: clientUser.email,
      role: Role.CLIENT,
      department: 'CLIENT',
      clientId: client.id,
      forcePasswordChange: Boolean(clientUser.forcePasswordChange),
      firstName,
      lastName,
      name: contactPerson || client.companyName,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiration as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiration as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: clientUser.id,
        email: clientUser.email,
        firstName,
        lastName,
        role: Role.CLIENT,
        department: 'CLIENT',
        forcePasswordChange: Boolean(clientUser.forcePasswordChange),
        clientId: client.id,
      },
    };
  }
}
