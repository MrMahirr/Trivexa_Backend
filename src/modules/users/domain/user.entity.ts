import { Role } from '../../../shared/enums/role.enum';
import { Department } from '../../../shared/enums/department.enum';

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

export class User implements UserEntity {
    constructor(
        public id: string,
        public email: string,
        public firstName: string,
        public lastName: string,
        public role: string,
        public department: string | null,
        public isActive: boolean,
        public forcePasswordChange: boolean,
        public createdAt: Date,
        public updatedAt: Date,
    ) { }

    static fromRow(row: any): User {
        return new User(
            row.id,
            row.email,
            row.first_name,
            row.last_name,
            row.role,
            row.department,
            row.is_active,
            row.force_password_change,
            row.created_at,
            row.updated_at,
        );
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

    // Domain Behaviors
    activate() {
        this.isActive = true;
        this.updatedAt = new Date();
    }

    deactivate() {
        this.isActive = false;
        this.updatedAt = new Date();
    }

    changeRole(newRole: Role) {
        this.role = newRole;
        this.updatedAt = new Date();
    }

    changeDepartment(newDept: Department) {
        this.department = newDept;
        this.updatedAt = new Date();
    }
}
