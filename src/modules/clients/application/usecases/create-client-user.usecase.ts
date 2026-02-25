import { Injectable, ConflictException } from '@nestjs/common';
import { ClientUsersRepository } from '../../infrastructure/client-users.repository';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CreateClientUserUseCase {
    constructor(
        private readonly clientUsersRepo: ClientUsersRepository,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async execute(clientId: string, email: string, rawPassword?: string) {
        const existingUser = await this.clientUsersRepo.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('A client user with this email already exists');
        }

        // Default password or generate random
        const password = rawPassword || Math.random().toString(36).slice(-10);
        const passwordHash = await bcrypt.hash(password, 10);

        const clientUser = await this.clientUsersRepo.create({
            clientId,
            email,
            passwordHash,
        });

        // TODO: Emit an event to send an email with the login credentials

        return clientUser;
    }
}
