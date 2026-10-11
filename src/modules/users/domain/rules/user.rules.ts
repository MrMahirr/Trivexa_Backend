/**
 * User Domain Kuralları
 *
 * Kullanıcı işlemlerinde uygulanması gereken iş kurallarını içerir.
 * Service ve UseCase katmanlarında bu kurallar çağrılarak
 * iş mantığı doğrulaması yapılır.
 */

/** Parola minimum gereksinimleri */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** Kullanıcı doğrulama kuralları */
export class UserRules {
  /**
   * Parolanın yeterli karmaşıklığa sahip olup olmadığını kontrol eder
   * En az 8 karakter, bir büyük harf, bir küçük harf, bir rakam
   */
  static isPasswordValid(password: string): {
    valid: boolean;
    message?: string;
  } {
    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      return {
        valid: false,
        message: `Parola en az ${PASSWORD_MIN_LENGTH} karakter olmalıdır.`,
      };
    }
    if (password.length > PASSWORD_MAX_LENGTH) {
      return {
        valid: false,
        message: `Parola en fazla ${PASSWORD_MAX_LENGTH} karakter olabilir.`,
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: 'Parola en az bir büyük harf içermelidir.',
      };
    }
    if (!/[a-z]/.test(password)) {
      return {
        valid: false,
        message: 'Parola en az bir küçük harf içermelidir.',
      };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Parola en az bir rakam içermelidir.' };
    }
    return { valid: true };
  }

  /**
   * Kullanıcının kendi hesabı üzerinde yapamayacağı işlemleri kontrol eder
   */
  static cannotActOnSelf(
    userId: string,
    targetUserId: string,
    action: string,
  ): void {
    if (userId === targetUserId) {
      throw new Error(
        `Kendi hesabınız üzerinde "${action}" işlemi yapamazsınız.`,
      );
    }
  }

  /**
   * Rol hiyerarşisini kontrol eder (üst rol alt rolü yönetebilir)
   */
  static canManageRole(actorRole: string, targetRole: string): boolean {
    const hierarchy: Record<string, number> = {
      ADMIN: 4,
      MANAGER: 3,
      DEVELOPER: 2,
      CLIENT: 1,
      GUEST: 0, // Renamed original CLIENT: 0 to GUEST: 0 to avoid key collision
    };
    return (hierarchy[actorRole] || 0) > (hierarchy[targetRole] || 0);
  }

  /**
   * Ad/Soyad doğrulama
   */
  static isNameValid(name: string): boolean {
    return (
      typeof name === 'string' &&
      name.trim().length >= 2 &&
      name.trim().length <= 100
    );
  }
}
