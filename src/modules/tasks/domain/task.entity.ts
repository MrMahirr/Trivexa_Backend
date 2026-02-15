export interface TaskEntity {
    id: string;
    projectId: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assigneeId: string | null;
    dueDate: string | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    // optional joined fields
    assigneeEmail?: string;
    assigneeFirstName?: string;
    assigneeLastName?: string;
}

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'];
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export class Task {
    static fromRow(row: any): TaskEntity {
        return {
            id: row.id,
            projectId: row.project_id,
            title: row.title,
            description: row.description,
            status: row.status,
            priority: row.priority,
            assigneeId: row.assignee_id,
            dueDate: row.due_date,
            createdBy: row.created_by,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            assigneeEmail: row.assignee_email,
            assigneeFirstName: row.assignee_first_name,
            assigneeLastName: row.assignee_last_name,
        };
    }
}
