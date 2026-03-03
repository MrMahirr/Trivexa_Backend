export interface UserLoggedInEvent {
  userId: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface UserCreatedEvent {
  userId: string;
  email: string;
  role: string;
  timestamp: Date;
}

export interface GenericAuditLogEvent {
  entityName: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'OTHER';
  userId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
