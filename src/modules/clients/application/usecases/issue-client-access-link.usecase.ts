import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { ClientUsersRepository } from '../../infrastructure/client-users.repository';
import { IssueClientAccessLinkDto } from '../../api/dto/issue-client-access-link.dto';
import { ClientsRepository } from '../../infrastructure/clients.repository';
import { CreateClientUserUseCase } from './create-client-user.usecase';

@Injectable()
export class IssueClientAccessLinkUseCase {
  private readonly logger = new Logger(IssueClientAccessLinkUseCase.name);

  constructor(
    private readonly clientUsersRepo: ClientUsersRepository,
    private readonly clientsRepo: ClientsRepository,
    private readonly createClientUserUseCase: CreateClientUserUseCase,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: IssueClientAccessLinkDto) {
    if (!dto.email && !dto.clientId) {
      throw new BadRequestException(
        'Email veya ClientId (istemci kullanici id) girilmelidir.',
      );
    }

    let user = null;
    if (dto.email) {
      user = await this.clientUsersRepo.findByEmail(dto.email);
      if (!user) {
        const client = await this.clientsRepo.findByEmail(dto.email);
        if (client) {
          user = await this.createClientUserUseCase.execute(
            client.id,
            client.email,
          );
        }
      }
    } else if (dto.clientId) {
      user = await this.clientUsersRepo.findById(dto.clientId);
      if (!user) {
        const client = await this.clientsRepo.findById(dto.clientId);
        if (client) {
          user = await this.createClientUserUseCase.execute(
            client.id,
            client.email,
          );
        }
      }
    }

    if (!user) {
      throw new NotFoundException('Kayitli bir musteri kullanicisi bulunamadi.');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.clientUsersRepo.createAccessLink(user.id, token, expiresAt);

    const portalBaseUrl = (
      this.configService.get<string>('app.clientPortalBaseUrl') ||
      this.configService.get<string>('CLIENT_PORTAL_BASE_URL') ||
      'http://localhost:3001'
    ).replace(/\/+$/, '');

    const magicLink = `${portalBaseUrl}/portal/auth/verify?token=${token}`;

    this.logger.debug(
      `[MOCK EMAIL SENT] Client access link created for ${user.email}. Token: ${token}`,
    );

    return {
      success: true,
      message: 'Erisim linki basariyla olusturuldu ve musteriye iletildi.',
      expiresAt,
      magicLink,
    };
  }
}
