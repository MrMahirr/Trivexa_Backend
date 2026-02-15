export interface UserEntity {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    department: string | null;
    isActive: boolean;
    forcePasswordChange: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserWithPassword extends UserEntity {
    passwordHash: string;
}

export class User {
    static fromRow(row: any): UserEntity {
        return {
            id: row.id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            role: row.role,
            department: row.department,
            isActive: row.is_active,
            forcePasswordChange: row.force_password_change,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    static toSafeResponse(user: UserEntity) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            department: user.department,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
