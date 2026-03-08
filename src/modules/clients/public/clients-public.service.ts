import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IssueClientAccessLinkUseCase } from '../application/usecases/issue-client-access-link.usecase';
import { ForceChangeClientPasswordUseCase } from '../application/usecases/force-change-client-password.usecase';
import { IssueClientAccessLinkDto } from '../api/dto/issue-client-access-link.dto';
import { ForceChangeClientPasswordDto } from '../api/dto/force-change-client-password.dto';
import { CreateClientPortalRequestDto } from '../api/dto/create-client-portal-request.dto';
import { ClientPortalRequestsRepository } from '../infrastructure/client-portal-requests.repository';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { Role } from '../../../shared/enums/role.enum';
import { SystemEvents } from '../../../shared/events/event.constants';

@Injectable()
export class ClientsPublicService {
  private readonly logger = new Logger(ClientsPublicService.name);

  constructor(
    private readonly issueAccessLinkUseCase: IssueClientAccessLinkUseCase,
    private readonly forceChangePasswordUseCase: ForceChangeClientPasswordUseCase,
    private readonly clientPortalRequestsRepository: ClientPortalRequestsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async issueAccessLink(dto: IssueClientAccessLinkDto) {
    return this.issueAccessLinkUseCase.execute(dto);
  }

  async forceChangePassword(dto: ForceChangeClientPasswordDto) {
    return this.forceChangePasswordUseCase.execute(dto);
  }

  async createClientPortalRequest(
    clientId: string,
    clientUserId: string,
    dto: CreateClientPortalRequestDto,
  ) {
    const request = await this.clientPortalRequestsRepository.create({
      clientId,
      clientUserId,
      projectId: dto.projectId,
      subject: dto.subject,
      description: dto.description,
      priority: dto.priority,
      type: dto.type,
    });

    try {
      const targetUserIds = await this.resolvePortalRequestNotificationTargets();
      if (targetUserIds.length) {
        this.eventEmitter.emit(SystemEvents.CLIENT_PORTAL_REQUEST_CREATED, {
          targetUserIds,
          requestId: request.id,
          clientId,
          clientUserId,
          projectId: request.project_id,
          subject: request.subject,
          priority: request.priority,
          type: request.type,
        });
      }
    } catch (error) {
      this.logger.warn(
        `Portal request notification dispatch failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return request;
  }

  async listClientPortalRequests(clientId: string) {
    return this.clientPortalRequestsRepository.findAllByClient(clientId);
  }

  private async resolvePortalRequestNotificationTargets(): Promise<string[]> {
    const targetRoles = [Role.ADMIN, Role.MANAGER, Role.ACCOUNT_MANAGER];
    const userIds = await this.usersRepository.findUserIdsByRoles(targetRoles);
    return Array.from(new Set(userIds.filter((value) => value && value.length > 0)));
  }
}
