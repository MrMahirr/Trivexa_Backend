export interface ProjectEntity {
    id: string;
    clientId: string | null;
    name: string;
    description: string | null;
    status: string;
    budget: number;
    startDate: string | null;
    deadline: string | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectMember {
    id: string;
    projectId: string;
    userId: string;
    role: string;
    joinedAt: Date;
    // joined user fields
    email?: string;
    firstName?: string;
    lastName?: string;
}

export class Project {
    static fromRow(row: any): ProjectEntity {
        return {
            id: row.id,
            clientId: row.client_id,
            name: row.name,
            description: row.description,
            status: row.status,
            budget: parseFloat(row.budget) || 0,
            startDate: row.start_date,
            deadline: row.deadline,
            createdBy: row.created_by,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    static memberFromRow(row: any): ProjectMember {
        return {
            id: row.id,
            projectId: row.project_id,
            userId: row.user_id,
            role: row.role,
            joinedAt: row.joined_at,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
        };
    }
}
