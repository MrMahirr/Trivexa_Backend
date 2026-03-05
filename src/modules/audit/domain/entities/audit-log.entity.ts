export class AuditLog {
  id: string;
  entityName: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'OTHER';
  userId?: string;
  userName?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;

  constructor(partial: Partial<AuditLog>) {
    Object.assign(this, partial);
    if (!this.timestamp) {
      this.timestamp = new Date();
    }
  }
}
