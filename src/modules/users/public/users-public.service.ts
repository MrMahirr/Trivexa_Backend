import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { User, UserEntity } from '../domain/user.entity';

/**
 * UsersPublicService — Diğer modüllere açılan kullanıcı API'si
 *
 * Auth, Notifications, Projects gibi diğer modüller
 * doğrudan UsersRepository yerine bu servisi kullanarak
 * kullanıcı bilgilerine erişir. Bu, modüller arası bağımlılığı
 * kontrol altında tutar.
 */
@Injectable()
export class UsersPublicService {
  constructor(private readonly usersRepo: UsersRepository) {}

  /**
   * ID ile kullanıcı getir (güvenli format — password hash olmadan)
   */
  async findById(
    id: string,
  ): Promise<ReturnType<typeof User.toSafeResponse> | null> {
    const user = await this.usersRepo.findById(id);
    return user ? User.toSafeResponse(user) : null;
  }

  /**
   * Email ile kullanıcı getir (auth modülü tarafından kullanılır)
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await this.usersRepo.findByEmail(email);
    return row ? User.fromRow(row) : null;
  }

  /**
   * Kullanıcının var olup olmadığını kontrol et
   */
  async exists(id: string): Promise<boolean> {
    const user = await this.usersRepo.findById(id);
    return !!user;
  }

  /**
   * Kullanıcının aktif olup olmadığını kontrol et
   */
  async isActive(id: string): Promise<boolean> {
    const user = await this.usersRepo.findById(id);
    return user ? user.isActive : false;
  }

  /**
   * Kullanıcının adını ve soyadını birleştirip döndür
   */
  async getFullName(id: string): Promise<string | null> {
    const user = await this.usersRepo.findById(id);
    return user ? `${user.firstName} ${user.lastName}` : null;
  }
}
