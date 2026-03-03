import { Role } from '../../../../shared/enums/role.enum';
import { RuleViolationError } from '../../../../domain/errors/rule-violation.error';

// İzinlerin (Permissions) global olarak tanımlandığı liste
export enum Permission {
  // Proje & Bilet (Task/Ticket) İzinleri
  CREATE_PROJECT = 'CREATE_PROJECT',
  UPDATE_PROJECT = 'UPDATE_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',
  VIEW_PROJECTS = 'VIEW_PROJECTS',

  CREATE_TASK = 'CREATE_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  DELETE_TASK = 'DELETE_TASK',
  VIEW_TASKS = 'VIEW_TASKS',

  // Kullanıcı & Yetkilendirme İzinleri (HR, RBAC)
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_USERS = 'VIEW_USERS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  MANAGE_DEPARTMENTS = 'MANAGE_DEPARTMENTS',
  VIEW_DEPARTMENTS = 'VIEW_DEPARTMENTS',

  // Toplantı (Meeting) & Sözleşme (Contract) İzinleri
  CREATE_MEETING = 'CREATE_MEETING',
  VIEW_MEETINGS = 'VIEW_MEETINGS',
  MANAGE_CONTRACTS = 'MANAGE_CONTRACTS',
  VIEW_CONTRACTS = 'VIEW_CONTRACTS',
}

// Role -> Permission Eşleştirme (Yetki Matrisi)
const RolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission), // Admin tüm yetkilere sahiptir.
  [Role.MANAGER]: [
    Permission.CREATE_PROJECT,
    Permission.UPDATE_PROJECT,
    Permission.VIEW_PROJECTS,
    Permission.CREATE_TASK,
    Permission.UPDATE_TASK,
    Permission.DELETE_TASK,
    Permission.VIEW_TASKS,
    Permission.VIEW_USERS,
    Permission.VIEW_DEPARTMENTS,
    Permission.CREATE_MEETING,
    Permission.VIEW_MEETINGS,
    Permission.MANAGE_CONTRACTS,
    Permission.VIEW_CONTRACTS,
  ],
  [Role.MEMBER]: [
    Permission.VIEW_PROJECTS,
    Permission.CREATE_TASK,
    Permission.UPDATE_TASK,
    Permission.VIEW_TASKS,
    Permission.VIEW_USERS,
    Permission.VIEW_DEPARTMENTS,
    Permission.VIEW_MEETINGS,
  ],
  [Role.VIEWER]: [
    Permission.VIEW_PROJECTS,
    Permission.VIEW_TASKS,
    Permission.VIEW_USERS,
    Permission.VIEW_DEPARTMENTS,
    Permission.VIEW_MEETINGS,
  ],
  [Role.CLIENT]: [
    // Müşteriler sadece kısıtlı görüntüleme ve belki toplantı randevusu alma yetkilerine sahiptir
    Permission.VIEW_PROJECTS,
    Permission.VIEW_TASKS,
    Permission.VIEW_CONTRACTS,
    Permission.VIEW_MEETINGS,
  ],
};

export class RbacRules {
  /**
   * Kullanıcının (Role) belirtilen eylemi (Permission) yapmaya izninin olup olmadığını fırlatma (Exception) olmadan test eder.
   */
  static can(role: Role, permission: Permission): boolean {
    const permissions = RolePermissions[role];
    if (!permissions) {
      return false; // Tanımsız rol için izin reddedilir
    }
    return permissions.includes(permission);
  }

  /**
   * Domain (İş) katmanında kritik kontroller için kullanılır; İzni yoksa Exception fırlatır.
   */
  static checkPermission(role: Role, permission: Permission): void {
    if (!this.can(role, permission)) {
      throw new RuleViolationError(
        'RBAC.PERMISSION_DENIED',
        `Erişim Engellendi: Bu işlemi gerçekleştirmek için '${permission}' yetkisine ihtiyacınız var.`,
      );
    }
  }
}
