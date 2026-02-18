import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export class CryptoUtil {
    static async hash(text: string, rounds = 10): Promise<string> {
        return bcrypt.hash(text, rounds);
    }

    static async verify(text: string, hash: string): Promise<boolean> {
        return bcrypt.compare(text, hash);
    }

    static generateRandomString(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex').slice(0, length);
    }

    static generateSalt(rounds = 10): Promise<string> {
        return bcrypt.genSalt(rounds);
    }
}
