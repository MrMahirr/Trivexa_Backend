/**
 * Project Domain Kuralları
 */
export class ProjectRules {
  static isNameValid(name: string): boolean {
    return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 200;
  }

  static isBudgetValid(budget: number): boolean {
    return typeof budget === 'number' && budget >= 0;
  }

  static isDeadlineAfterStart(startDate: string, deadline: string): boolean {
    if (!startDate || !deadline) return true;
    return new Date(deadline) >= new Date(startDate);
  }

  static canChangeStatus(currentStatus: string, newStatus: string): boolean {
    const allowed: Record<string, string[]> = {
      DRAFT: ['PLANNING', 'CANCELLED'],
      PLANNING: ['IN_PROGRESS', 'ON_HOLD', 'CANCELLED'],
      IN_PROGRESS: ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
      ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
      COMPLETED: ['ARCHIVED'],
      CANCELLED: ['PLANNING'],
      ARCHIVED: [],
    };
    return (allowed[currentStatus] || []).includes(newStatus);
  }
}
