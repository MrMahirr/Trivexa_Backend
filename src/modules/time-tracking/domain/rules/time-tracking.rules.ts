/**
 * Time Tracking Domain Kuralları
 */
export class TimeTrackingRules {
  static isDescriptionValid(desc: string): boolean {
    return typeof desc === 'string' && desc.trim().length <= 500;
  }

  static isDurationValid(minutes: number): boolean {
    return typeof minutes === 'number' && minutes > 0 && minutes <= 1440;
  }

  static canStopTimer(startTime: Date, endTime: Date | null): boolean {
    if (endTime) return false; // zaten durdurulmuş
    return new Date() > startTime;
  }

  static calculateDuration(startTime: Date, endTime: Date): number {
    const diffMs = endTime.getTime() - startTime.getTime();
    return Math.round(diffMs / 60000); // dakikaya çevir
  }
}
