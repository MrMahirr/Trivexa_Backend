export class MaskUtil {
    static email(email: string): string {
        const [local, domain] = email.split('@');
        if (!domain) return email;
        const maskedLocal = local.length > 2
            ? `${local.slice(0, 2)}***${local.slice(-1)}`
            : `${local}***`;
        return `${maskedLocal}@${domain}`;
    }

    static phone(phone: string): string {
        return phone.replace(/.(?=.{4})/g, '*');
    }

    static creditCard(cc: string): string {
        return cc.replace(/.(?=.{4})/g, '*');
    }
}
