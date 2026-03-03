import { Injectable } from '@nestjs/common';
import { AuthService } from '../application/auth.service';

/**
 * AuthPublicService — Diğer modüllere açılan kimlik doğrulama API'si
 *
 * Notifications, Projects gibi diğer modüller
 * doğrudan AuthService yerine bu servisi kullanarak
 * auth işlemlerine erişir. Modüller arası bağımlılığı kontrol altında tutar.
 */
@Injectable()
export class AuthPublicService {
  constructor(private readonly authService: AuthService) {}

  /**
   * Kullanıcı girişi yap ve token'ları döndür
   */
  async login(email: string, password: string) {
    return this.authService.login(email, password);
  }

  /**
   * Refresh token ile yeni access token al
   */
  async refreshToken(refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  /**
   * Oturumu kapat
   */
  async logout(refreshToken: string | undefined, accessToken: string) {
    return this.authService.logout(refreshToken, accessToken);
  }
}
