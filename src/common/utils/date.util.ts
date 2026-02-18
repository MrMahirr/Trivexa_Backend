export class DateUtil {
    static format(date: Date, locale: string = 'en-US'): string {
        return new Intl.DateTimeFormat(locale).format(date);
    }

    static addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    static isBefore(date1: Date, date2: Date): boolean {
        return date1.getTime() < date2.getTime();
    }

    static isAfter(date1: Date, date2: Date): boolean {
        return date1.getTime() > date2.getTime();
    }

    static now(): Date {
        return new Date();
    }
}
