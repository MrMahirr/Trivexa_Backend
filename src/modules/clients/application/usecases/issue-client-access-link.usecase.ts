import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientUsersRepository } from '../../infrastructure/client-users.repository';
import { randomBytes } from 'crypto';

@Injectable()
export class IssueClientAccessLinkUseCase {
    constructor(
        private readonly clientUsersRepo: ClientUsersRepository,
    ) { }

    async execute(email: string) {
        const user = await this.clientUsersRepo.findByEmail(email);
        if (!user) {
            throw new NotFoundException('Client user not found');
        }

        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours validity

        await this.clientUsersRepo.createAccessLink(user.id, token, expiresAt);

        // TODO: Send magic link to user's email
        // For now, return the token for testing/response
        return { token, expiresAt };
    }
}
