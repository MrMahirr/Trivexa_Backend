import { Role } from '../../../shared/enums/role.enum';

export interface UserEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string | null;
  subDepartmentId: string | null;
  subDepartmentName: string | null;
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
    public subDepartmentId: string | null,
    public subDepartmentName: string | null,
    public isActive: boolean,
    public forcePasswordChange: boolean,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  static fromRow(row: any): User {
    return new User(
      row.id,
      row.email,
      row.first_name,
      row.last_name,
      row.role,
      row.department,
      row.sub_department_id ?? null,
      row.sub_department_name ?? null,
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
      subDepartmentId: user.subDepartmentId,
      subDepartmentName: user.subDepartmentName,
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

  changeDepartment(newDept: string) {
    this.department = newDept;
    this.updatedAt = new Date();
  }
}
