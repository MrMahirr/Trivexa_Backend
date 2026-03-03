/**
 * Auth Token SQL Sorguları
 *
 * Refresh token ve password reset token tablolarına yapılan
 * SQL sorgularını merkezi olarak tutar.
 */
export const AuthTokenSql = {
  /** Refresh token oluştur */
  createRefreshToken: `
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, token_hash, expires_at, created_at
  `,

  /** Token hash ile geçerli refresh token bul */
  findValidRefreshToken: `
    SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
    FROM refresh_tokens
    WHERE token_hash = $1
      AND revoked_at IS NULL
      AND expires_at > NOW()
  `,

  /** Token hash ile iptal et */
  revokeByTokenHash: `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE token_hash = $1
  `,

  /** Kullanıcının tüm refresh token'larını iptal et */
  revokeAllByUserId: `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE user_id = $1 AND revoked_at IS NULL
  `,

  /** Süresi dolmuş token'ları temizle */
  cleanupExpiredTokens: `
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW() OR revoked_at IS NOT NULL
  `,

  /** Password reset token oluştur */
  createPasswordResetToken: `
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, token, expires_at, created_at
  `,

  /** Password reset token doğrula */
  findValidPasswordResetToken: `
    SELECT id, user_id, token, expires_at, created_at
    FROM password_reset_tokens
    WHERE token = $1 AND expires_at > NOW()
  `,

  /** Kullanılmış password reset token'ı sil */
  deletePasswordResetToken: `
    DELETE FROM password_reset_tokens WHERE token = $1
  `,

  /** Kullanıcının tüm password reset token'larını sil */
  deleteAllPasswordResetTokens: `
    DELETE FROM password_reset_tokens WHERE user_id = $1
  `,
};
