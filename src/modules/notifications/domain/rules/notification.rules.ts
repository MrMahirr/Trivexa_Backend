/**
 * Notification Domain Kuralları
 */
export class NotificationRules {
  static isTitleValid(title: string): boolean {
    return (
      typeof title === 'string' &&
      title.trim().length >= 1 &&
      title.trim().length <= 200
    );
  }

  static isMessageValid(message: string): boolean {
    return (
      typeof message === 'string' &&
      message.trim().length >= 1 &&
      message.trim().length <= 1000
    );
  }

  static readonly VALID_TYPES = [
    'INFO',
    'TASK_ASSIGNED',
    'TICKET_UPDATE',
    'INVOICE_SENT',
    'PAYMENT_RECEIVED',
    'PROJECT_CREATED',
    'CONTRACT_CREATED',
    'CONTRACT_SIGNED',
    'MEETING_SCHEDULED',
  ] as const;

  static isValidType(type: string): boolean {
    return NotificationRules.VALID_TYPES.includes(type as any);
  }
}
