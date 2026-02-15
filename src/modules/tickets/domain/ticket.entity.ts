export interface TicketEntity {
    id: string;
    subject: string;
    description: string;
    type: string;
    status: string;
    priority: string;
    createdBy: string;
    assignedTo: string | null;
    createdAt: Date;
    updatedAt: Date;
    // joined fields
    creatorEmail?: string;
    creatorName?: string;
    assigneeEmail?: string;
    assigneeName?: string;
}

export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
export const TICKET_TYPES = ['BUG', 'FEATURE', 'SUPPORT', 'OTHER'];

export class Ticket {
    static fromRow(row: any): TicketEntity {
        return {
            id: row.id,
            subject: row.subject,
            description: row.description,
            type: row.type,
            status: row.status,
            priority: row.priority,
            createdBy: row.created_by,
            assignedTo: row.assigned_to,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            creatorEmail: row.creator_email,
            creatorName: row.creator_first_name ? `${row.creator_first_name} ${row.creator_last_name}`.trim() : undefined,
            assigneeEmail: row.assignee_email,
            assigneeName: row.assignee_first_name ? `${row.assignee_first_name} ${row.assignee_last_name}`.trim() : undefined,
        };
    }
}
