import { Module } from '@nestjs/common';
import { ClientsController } from './api/clients.controller';
import { ClientPortalController } from './api/client-portal.controller';
import { ClientsService } from './application/clients.service';
import { ClientsRepository } from './infrastructure/clients.repository';
import { CreateClientUseCase } from './application/usecases/create-client.usecase';
import { UpdateClientUseCase } from './application/usecases/update-client.usecase';
import { AuthModule } from '../auth/auth.module';
import { ClientUsersRepository } from './infrastructure/client-users.repository';
import { CreateClientUserUseCase } from './application/usecases/create-client-user.usecase';
import { IssueClientAccessLinkUseCase } from './application/usecases/issue-client-access-link.usecase';

@Module({
  imports: [AuthModule],
  controllers: [ClientsController, ClientPortalController],
  providers: [
    ClientsService,
    ClientsRepository,
    CreateClientUseCase,
    UpdateClientUseCase,
    ClientUsersRepository,
    CreateClientUserUseCase,
    IssueClientAccessLinkUseCase,
  ],
  exports: [
    ClientsService,
    ClientsRepository,
    CreateClientUseCase,
    UpdateClientUseCase,
    ClientUsersRepository,
    CreateClientUserUseCase,
    IssueClientAccessLinkUseCase,
  ],
})
export class ClientsModule { }
