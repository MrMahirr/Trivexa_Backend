import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { User } from '../../domain/user.entity';

/**
 * UsersAppService — Application Service katmanı
 *
 * UsersService (orchestration) ile Repository arasında ek bir katman sağlar.
 * Çoklu repository işlemlerinin koordinasyonu ve
 * cross-cutting concern'ler (loglama, audit) burada yapılır.
 *
 * Not: Şu an UsersService zaten bu işlevi görüyor.
 * Bu dosya gelecekte servisin büyümesi halinde refactoring için hazırdır.
 */
@Injectable()
export class UsersAppService {
  constructor(private readonly usersRepo: UsersRepository) {}

  /**
   * Kullanıcı var mı kontrolü (email ile)
   */
  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.usersRepo.findByEmail(email);
    return !!user;
  }

  /**
   * Kullanıcıyı güvenli formatta getir
   */
  async getUserSafe(
    id: string,
  ): Promise<ReturnType<typeof User.toSafeResponse> | null> {
    const user = await this.usersRepo.findById(id);
    return user ? User.toSafeResponse(user) : null;
  }

  /**
   * Kullanıcının aktif olup olmadığını kontrol et
   */
  async isUserActive(id: string): Promise<boolean> {
    const user = await this.usersRepo.findById(id);
    return user ? user.isActive : false;
  }
}
