/**
 * Email Value Object
 *
 * E-posta adresinin format doğrulaması ve normalizasyonunu sağlar.
 * Immutable value object pattern'ı ile tasarlanmıştır.
 */
export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * E-posta adresi oluştur (doğrulama + normalizasyon)
   */
  static create(email: string): Email {
    if (!email || typeof email !== 'string') {
      throw new Error('E-posta adresi zorunludur.');
    }

    const normalized = email.trim().toLowerCase();

    if (!Email.isValid(normalized)) {
      throw new Error(`"${email}" geçerli bir e-posta adresi değildir.`);
    }

    return new Email(normalized);
  }

  /**
   * E-posta format doğrulaması
   */
  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get value(): string {
    return this._value;
  }

  /**
   * Domain kısmını döndürür (örn: "trivexa.com")
   */
  get domain(): string {
    return this._value.split('@')[1];
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
