/**
 * Trivexa i18n (Internationalization) — API Hata Mesajları
 *
 * Bu dosya, API hata mesajlarının çoklu dil desteğiyle döndürülmesi için kullanılır.
 * Accept-Language header'ına göre istemciye uygun dilde hata mesajı sağlanır.
 *
 * Kullanım:
 *   import { t } from 'src/shared/i18n/messages';
 *   throw new BadRequestException(t('VALIDATION_FAILED', lang));
 */

export type SupportedLanguage = 'en' | 'tr';

const messages: Record<string, Record<SupportedLanguage, string>> = {
  // Auth
  INVALID_CREDENTIALS: {
    en: 'Invalid email or password.',
    tr: 'Geçersiz e-posta veya şifre.',
  },
  ACCOUNT_DEACTIVATED: {
    en: 'Your account has been deactivated. Please contact admin.',
    tr: 'Hesabınız devre dışı bırakılmıştır. Lütfen yöneticiyle iletişime geçin.',
  },
  TOKEN_EXPIRED: {
    en: 'Your session has expired. Please log in again.',
    tr: 'Oturumunuzun süresi dolmuştur. Lütfen tekrar giriş yapın.',
  },
  UNAUTHORIZED: {
    en: 'You are not authorized to perform this action.',
    tr: 'Bu işlemi gerçekleştirme yetkiniz yok.',
  },

  // Validation
  VALIDATION_FAILED: {
    en: 'Input validation failed. Please check your data.',
    tr: 'Giriş doğrulaması başarısız. Lütfen verilerinizi kontrol edin.',
  },

  // Resources
  NOT_FOUND: {
    en: 'The requested resource was not found.',
    tr: 'İstenen kaynak bulunamadı.',
  },
  CONFLICT: {
    en: 'A resource with this data already exists.',
    tr: 'Bu veriye sahip bir kaynak zaten mevcut.',
  },
  FORBIDDEN: {
    en: 'You do not have permission to access this resource.',
    tr: 'Bu kaynağa erişim izniniz yok.',
  },

  // Rate Limiting
  TOO_MANY_REQUESTS: {
    en: 'Too many requests. Please try again later.',
    tr: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
  },

  // Server
  INTERNAL_ERROR: {
    en: 'An internal server error occurred.',
    tr: 'Sunucu hatası oluştu.',
  },

  // Finance
  INVOICE_NOT_FOUND: {
    en: 'Invoice not found.',
    tr: 'Fatura bulunamadı.',
  },
  PAYMENT_EXCEEDS_BALANCE: {
    en: 'Payment amount exceeds the remaining invoice balance.',
    tr: 'Ödeme tutarı kalan fatura bakiyesini aşıyor.',
  },
  EXPENSE_ALREADY_PROCESSED: {
    en: 'This expense has already been processed.',
    tr: 'Bu masraf zaten işlenmiştir.',
  },
};

/**
 * Mesajı dile göre döndürür. Varsayılan: İngilizce.
 */
export function t(key: string, lang: SupportedLanguage = 'en'): string {
  const entry = messages[key];
  if (!entry) return key;
  return entry[lang] || entry['en'] || key;
}

/**
 * Accept-Language header'ından dili çıkarır.
 */
export function extractLanguage(
  acceptLanguage?: string,
): SupportedLanguage {
  if (!acceptLanguage) return 'en';
  const lang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
  if (lang === 'tr') return 'tr';
  return 'en';
}
