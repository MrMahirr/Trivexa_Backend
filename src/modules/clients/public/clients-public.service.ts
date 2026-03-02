import { Injectable } from '@nestjs/common';
import { IssueClientAccessLinkUseCase } from '../application/usecases/issue-client-access-link.usecase';
import { ForceChangeClientPasswordUseCase } from '../application/usecases/force-change-client-password.usecase';
import { IssueClientAccessLinkDto } from '../api/dto/issue-client-access-link.dto';
import { ForceChangeClientPasswordDto } from '../api/dto/force-change-client-password.dto';

@Injectable()
export class ClientsPublicService {
  constructor(
    private readonly issueAccessLinkUseCase: IssueClientAccessLinkUseCase,
    private readonly forceChangePasswordUseCase: ForceChangeClientPasswordUseCase,
  ) {}

  async issueAccessLink(dto: IssueClientAccessLinkDto) {
    return this.issueAccessLinkUseCase.execute(dto);
  }

  async forceChangePassword(dto: ForceChangeClientPasswordDto) {
    return this.forceChangePasswordUseCase.execute(dto);
  }
}
