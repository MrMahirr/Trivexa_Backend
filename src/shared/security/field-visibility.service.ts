import { Injectable } from '@nestjs/common';

@Injectable()
export class FieldVisibilityService {
  /**
   * Masks sensitive data like email or phone numbers
   */
  maskEmail(email: string): string {
    if (!email) return email;
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;

    const maskedName =
      name.length > 2
        ? `${name.slice(0, 2)}***${name.slice(-1)}`
        : `${name.slice(0, 1)}***`;

    return `${maskedName}@${domain}`;
  }

  maskPhone(phone: string): string {
    if (!phone) return phone;
    // Keep last 4 digits visible, mask the rest
    if (phone.length <= 4) return phone;
    const masked = '*'.repeat(phone.length - 4);
    const visible = phone.slice(-4);
    return `${masked}${visible}`;
  }
}
