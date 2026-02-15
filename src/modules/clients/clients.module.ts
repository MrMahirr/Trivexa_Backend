import { Module } from '@nestjs/common';
import { ClientsController } from './api/clients.controller';
import { ClientsService } from './application/clients.service';
import { ClientsRepository } from './infrastructure/clients.repository';

@Module({
    controllers: [ClientsController],
    providers: [ClientsService, ClientsRepository],
    exports: [ClientsService, ClientsRepository],
})
export class ClientsModule { }
