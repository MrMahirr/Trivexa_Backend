import { Module } from '@nestjs/common';
import { ClientsController } from './api/clients.controller';
import { ClientsService } from './application/clients.service';
import { ClientsRepository } from './infrastructure/clients.repository';
import { CreateClientUseCase } from './application/usecases/create-client.usecase';
import { UpdateClientUseCase } from './application/usecases/update-client.usecase';

@Module({
    controllers: [ClientsController],
    providers: [
        ClientsService,
        ClientsRepository,
        CreateClientUseCase,
        UpdateClientUseCase,
    ],
    exports: [
        ClientsService,
        ClientsRepository,
        CreateClientUseCase,
        UpdateClientUseCase,
    ],
})
export class ClientsModule { }
