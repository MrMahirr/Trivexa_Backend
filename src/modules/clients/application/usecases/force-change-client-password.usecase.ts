import { Injectable, Logger } from '@nestjs/common';

import { ClientUsersRepository } from '../../infrastructure/client-users.repository';
import { ForceChangeClientPasswordDto } from '../../api/dto/force-change-client-password.dto';
import * as bcrypt from 'bcrypt';
import { DomainError, DomainErrorType } from "../../../../shared/errors/domain.error";

@Injectable()
export class ForceChangeClientPasswordUseCase {
  private readonly logger = new Logger(ForceChangeClientPasswordUseCase.name);

  constructor(private readonly clientUsersRepo: ClientUsersRepository) {}

  async execute(dto: ForceChangeClientPasswordDto) {
    // İstemci id doğrulama için öncelikle DB dökümü alınmalı (Eğer id ile bulma yazıldıysa)
    // Repo'da sadece 'findByEmail' olduğu için şu aşamada DB seviyesinde Update işlemi NotFound dönebilir.
    // İleriki fazlarda "findById" eklendiğinde tam kullanıcı kontrolü sağlanabilir.

    try {
      // Şifreyi bcrypt ile tuzla (hash)
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(dto.newPassword, saltRounds);

      // Veritabanını güncelle
      await this.clientUsersRepo.updatePasswordHash(
        dto.clientId,
        hashedPassword,
      );

      this.logger.log(
        `Client user password forcefully changed. ClientID: ${dto.clientId}`,
      );

      return {
        success: true,
        message:
          'İstemci şifresi başarıyla güncellendi. Yeni şifreyle sisteme giriş yapılabilir.',
      };
    } catch (error) {
      this.logger.error(`Error updating client password: ${error.message}`);
      // Örneğin: clientId geçersiz bir uuid ise db fırlatır
      throw new DomainError(
        'Şifre güncellenirken bir hata oluştu veya geçersiz Master Müşteri ID.', DomainErrorType.BUSINESS_RULE);
    }
  }
}
