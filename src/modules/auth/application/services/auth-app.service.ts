import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * AuthAppService — Application Service katmanı
 *
 * AuthService ile dış katmanlar arasında ek bir soyutlama katmanı sağlar.
 * Token oluşturma, doğrulama ve oturum yönetimi gibi
 * cross-cutting işlemler burada koordine edilir.
 *
 * Not: Şu an AuthService zaten bu işlevi görüyor.
 * Bu dosya gelecekte auth modülü büyüdüğünde genişletilmek üzere hazırdır.
 */
@Injectable()
export class AuthAppService {
  constructor(private readonly authService: AuthService) {}

  /**
   * Kullanıcının giriş yapıp yapamayacağını kontrol et
   */
  async canLogin(email: string, password: string): Promise<boolean> {
    try {
      await this.authService.login(email, password);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Refresh token'ın geçerli olup olmadığını kontrol et
   */
  async isTokenValid(refreshToken: string): Promise<boolean> {
    try {
      await this.authService.refresh(refreshToken);
      return true;
    } catch {
      return false;
    }
  }
}
