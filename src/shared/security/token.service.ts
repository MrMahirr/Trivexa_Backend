import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class TokenService {
  /**
   * Generates a cryptographically strong random token
   * @param length The length of the token string (default 32 characters = 16 bytes)
   */
  generateRandomToken(length: number = 32): string {
    const byteLength = Math.ceil(length / 2);
    return randomBytes(byteLength).toString('hex').slice(0, length);
  }

  /**
   * Generates a numeric OTP (One Time Password)
   * @param length Length of OTP (default 6)
   */
  generateOTP(length: number = 6): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }
}
