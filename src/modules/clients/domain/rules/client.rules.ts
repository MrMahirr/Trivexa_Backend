/**
 * Client Domain Kuralları
 *
 * Müşteri işlemlerinde uygulanması gereken iş kurallarını içerir.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export class ClientRules {
  /**
   * Şirket adı doğrulaması
   */
  static isCompanyNameValid(name: string): {
    valid: boolean;
    message?: string;
  } {
    if (!name || name.trim().length < 2) {
      return {
        valid: false,
        message: 'Şirket adı en az 2 karakter olmalıdır.',
      };
    }
    if (name.trim().length > 200) {
      return {
        valid: false,
        message: 'Şirket adı en fazla 200 karakter olabilir.',
      };
    }
    return { valid: true };
  }

  /**
   * Müşteri e-posta doğrulaması
   */
  static isEmailValid(email: string): boolean {
    return EMAIL_REGEX.test(email);
  }

  /**
   * İletişim kişisi adı doğrulaması
   */
  static isContactPersonValid(name: string): boolean {
    return (
      typeof name === 'string' &&
      name.trim().length >= 2 &&
      name.trim().length <= 100
    );
  }

  /**
   * Müşteri portal kullanıcısı oluşturulabilir mi kontrolü
   */
  static canCreateClientUser(clientIsActive: boolean): {
    valid: boolean;
    message?: string;
  } {
    if (!clientIsActive) {
      return {
        valid: false,
        message: 'Pasif müşteri için portal kullanıcısı oluşturulamaz.',
      };
    }
    return { valid: true };
  }

  /**
   * Erişim linki süresinin geçerli olup olmadığını kontrol eder
   */
  static isAccessLinkValid(expiresAt: Date): boolean {
    return new Date() < expiresAt;
  }
}
