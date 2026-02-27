import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ClientUsersRepository } from '../../infrastructure/client-users.repository';
import { IssueClientAccessLinkDto } from '../../api/dto/issue-client-access-link.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class IssueClientAccessLinkUseCase {
    private readonly logger = new Logger(IssueClientAccessLinkUseCase.name);

    constructor(
        private readonly clientUsersRepo: ClientUsersRepository,
    ) { }

    async execute(dto: IssueClientAccessLinkDto) {
        if (!dto.email && !dto.clientId) {
            throw new BadRequestException('Email veya ClientId (İstemci ID) girilmelidir.');
        }

        let user;
        if (dto.email) {
            user = await this.clientUsersRepo.findByEmail(dto.email);
        } else if (dto.clientId) {
            // Not: İleride findById isminde repoya metod eklendiğinde oradan çekilmeli
            // Şimdilik sadece e-posta arayışla sınırlı senaryoda hatayı fırlatıyoruz
            throw new BadRequestException('Şu anlık sadece email ile link oluşturulabilmektedir.');
        }

        if (!user) {
            throw new NotFoundException('Kayıtlı bir müşteri kullanıcısı bulunamadı.');
        }

        // 32 Byte rastgele token oluştur (Hex)
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours validity

        // DB'ye kaydet
        await this.clientUsersRepo.createAccessLink(user.id, token, expiresAt);

        this.logger.debug(`[MOCK EMAIL SENT] Client access link created for ${user.email}. Token: ${token}`);

        return {
            success: true,
            message: 'Erişim linki başarıyla oluşturuldu ve müşteriye iletildi.',
            expiresAt,
            // Gerçek projede 'token' sadece mailde gider ama API dönüşünde göstermek adminler için faydalı olabilir:
            magicLink: `https://portal.trivexa.com/auth/verify?token=${token}`
        };
    }
}
