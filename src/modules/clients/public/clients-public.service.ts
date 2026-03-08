import { Injectable } from '@nestjs/common';
import { IssueClientAccessLinkUseCase } from '../application/usecases/issue-client-access-link.usecase';
import { ForceChangeClientPasswordUseCase } from '../application/usecases/force-change-client-password.usecase';
import { IssueClientAccessLinkDto } from '../api/dto/issue-client-access-link.dto';
import { ForceChangeClientPasswordDto } from '../api/dto/force-change-client-password.dto';
import { CreateClientPortalRequestDto } from '../api/dto/create-client-portal-request.dto';
import { ClientPortalRequestsRepository } from '../infrastructure/client-portal-requests.repository';

@Injectable()
export class ClientsPublicService {
  constructor(
    private readonly issueAccessLinkUseCase: IssueClientAccessLinkUseCase,
    private readonly forceChangePasswordUseCase: ForceChangeClientPasswordUseCase,
    private readonly clientPortalRequestsRepository: ClientPortalRequestsRepository,
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
    return this.clientPortalRequestsRepository.create({
      clientId,
      clientUserId,
      subject: dto.subject,
      description: dto.description,
      priority: dto.priority,
      type: dto.type,
    });
  }

  async listClientPortalRequests(clientId: string) {
    return this.clientPortalRequestsRepository.findAllByClient(clientId);
  }
}
