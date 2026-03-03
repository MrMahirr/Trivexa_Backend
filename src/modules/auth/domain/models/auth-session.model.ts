/**
 * AuthSession Domain Modeli
 *
 * Bir kullanıcı oturumunu temsil eder.
 * Refresh token, erişim token'ı ve oturum metadata'sını içerir.
 */

export interface AuthSessionProps {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  ip?: string;
  userAgent?: string;
}

export class AuthSession {
  readonly userId: string;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: Date;
  readonly ip?: string;
  readonly userAgent?: string;
  readonly createdAt: Date;

  constructor(props: AuthSessionProps) {
    this.userId = props.userId;
    this.accessToken = props.accessToken;
    this.refreshToken = props.refreshToken;
    this.expiresAt = props.expiresAt;
    this.ip = props.ip;
    this.userAgent = props.userAgent;
    this.createdAt = new Date();
  }

  /**
   * Oturum süresinin dolup dolmadığını kontrol eder
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Oturumun hâlâ geçerli olup olmadığını kontrol eder
   */
  isValid(): boolean {
    return !this.isExpired();
  }

  /**
   * Token yanıtı olarak döndürülecek veri
   */
  toResponse(): { accessToken: string; refreshToken: string; expiresAt: Date } {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresAt: this.expiresAt,
    };
  }
}
