export class AuditLog {
    id: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;

    constructor(partial: Partial<AuditLog>) {
        Object.assign(this, partial);
    }
}
