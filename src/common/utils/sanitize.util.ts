export class SanitizeUtil {
    static trim(obj: any): any {
        if (typeof obj === 'string') {
            return obj.trim();
        }
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => SanitizeUtil.trim(item));
        }
        return Object.keys(obj).reduce((acc, key) => {
            acc[key] = SanitizeUtil.trim(obj[key]);
            return acc;
        }, {} as any);
    }
}
