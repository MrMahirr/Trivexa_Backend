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
import { ForceChangeClientPasswordUseCase } from './application/usecases/force-change-client-password.usecase';
import { ClientPortalLoginUseCase } from './application/usecases/client-portal-login.usecase';
import { ClientsPublicService } from './public/clients-public.service';
import { ProjectsModule } from '../projects/projects.module';
import { MeetingsModule } from '../meetings/meetings.module';
import { ContractsModule } from '../contracts/contracts.module';
import { FinanceModule } from '../finance/finance.module';
import { TicketsModule } from '../tickets/tickets.module';
import { ClientPortalRequestsRepository } from './infrastructure/client-portal-requests.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    AuthModule,
    ProjectsModule,
    MeetingsModule,
    ContractsModule,
    FinanceModule,
    TicketsModule,
    UsersModule,
  ],
  controllers: [ClientsController, ClientPortalController],
  providers: [
    ClientsService,
    ClientsRepository,
    CreateClientUseCase,
    UpdateClientUseCase,
    ClientUsersRepository,
    CreateClientUserUseCase,
    IssueClientAccessLinkUseCase,
    ForceChangeClientPasswordUseCase,
    ClientPortalLoginUseCase,
    ClientsPublicService,
    ClientPortalRequestsRepository,
  ],
  exports: [
    ClientsService,
    ClientsRepository,
    CreateClientUseCase,
    UpdateClientUseCase,
    ClientUsersRepository,
    CreateClientUserUseCase,
    IssueClientAccessLinkUseCase,
    ForceChangeClientPasswordUseCase,
    ClientPortalLoginUseCase,
    ClientsPublicService,
    ClientPortalRequestsRepository,
  ],
})
export class ClientsModule {}
