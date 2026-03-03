/**
 * Phone Value Object
 *
 * Telefon numarasının format doğrulaması ve normalizasyonunu sağlar.
 * Türkiye telefon numaraları ve uluslararası formatları destekler.
 */
export class Phone {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Telefon numarası oluştur (doğrulama + normalizasyon)
   */
  static create(phone: string): Phone {
    if (!phone || typeof phone !== 'string') {
      throw new Error('Telefon numarası zorunludur.');
    }

    const normalized = Phone.normalize(phone);

    if (!Phone.isValid(normalized)) {
      throw new Error(`"${phone}" geçerli bir telefon numarası değildir.`);
    }

    return new Phone(normalized);
  }

  /**
   * Telefon numarası doğrulaması
   * +90, 0 ile başlayan ve uluslararası formatları kabul eder
   */
  static isValid(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Telefon numarasını normalize eder
   * Boşluk, parantez, tire gibi karakterleri temizler
   */
  static normalize(phone: string): string {
    return phone.replace(/[\s\-().]/g, '');
  }

  get value(): string {
    return this._value;
  }

  /**
   * Formatlanmış gösterim (örn: +90 532 123 45 67)
   */
  get formatted(): string {
    if (this._value.startsWith('+90') && this._value.length === 13) {
      const digits = this._value.slice(3);
      return `+90 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
    }
    return this._value;
  }

  equals(other: Phone): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
