export interface TimeEntryEntity {
    id: string;
    userId: string;
    projectId: string | null;
    taskId: string | null;
    startTime: Date;
    endTime: Date | null;
    durationMinutes: number | null;
    description: string | null;
    isManual: boolean;
    approved: boolean;
    createdAt: Date;
    updatedAt: Date;
    // joined fields
    projectName?: string;
    taskTitle?: string;
    userEmail?: string;
    userFirstName?: string;
    userLastName?: string;
}

export class TimeEntry {
    static fromRow(row: any): TimeEntryEntity {
        return {
            id: row.id,
            userId: row.user_id,
            projectId: row.project_id,
            taskId: row.task_id,
            startTime: row.start_time,
            endTime: row.end_time,
            durationMinutes: row.duration_minutes,
            description: row.description,
            isManual: row.is_manual,
            approved: row.approved,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            projectName: row.project_name,
            taskTitle: row.task_title,
            userEmail: row.user_email,
            userFirstName: row.user_first_name,
            userLastName: row.user_last_name,
        };
    }
}
