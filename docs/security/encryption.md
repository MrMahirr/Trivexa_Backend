# Encryption Standards

This document specifies the cryptographic algorithms and libraries used within Trivexa.

## 1. Hashing (One-Way)

Used for data that never needs to be decrypted (Passwords).

- **Algorithm**: `bcrypt` (or `Argon2id` if available).
- **Library**: `bcrypt` (npm).
- **Configuration**:
    - Salt Rounds: `10` (Minimum), `12` (Recommended).

```typescript
import * as bcrypt from 'bcrypt';

const hash = await bcrypt.hash(password, 12);
const isMatch = await bcrypt.compare(password, hash);
```

## 2. Symmetric Encryption (Two-Way)

Used for sensitive data that the system needs to read (API Tokens, Refresh Tokens, PII fields).

- **Algorithm**: `AES-256-GCM` (Galois/Counter Mode).
- **Library**: Node.js native `crypto` module.
- **Key Size**: 256 bits (32 bytes).
- **IV Size**: 96 bits (12 bytes) - Random per encryption.

### Implementation
We use a utility class `EncryptionService`.

```typescript
encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
  // ... returns 'iv:authTag:encryptedText'
}
```

## 3. Key Management

- **Master Key**: Stored in `APP_Encryption_Key` environment variable or AWS KMS.
- **Rotation**: Keys should be rotated annually. A script re-encrypts DB records with the new key.
- **Storage**: NEVER commit keys to Git.

## 4. Transport Layer Security (TLS)

- **Version**: TLS 1.2 or 1.3.
- **Ciphers**: Restricted to strong suites (e.g., ECDHE-RSA-AES256-GCM-SHA384).
- **HSTS**: `Strict-Transport-Security` header set to `max-age=31536000; includeSubDomains`.
