import { Permission } from '../../../../shared/enums/permission.enum';
import { Role } from '../../../../shared/enums/role.enum';

export const RbacSchemaSql = {
  createRolesTable: `
    CREATE TABLE IF NOT EXISTS roles (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  createPermissionsTable: `
    CREATE TABLE IF NOT EXISTS permissions (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      group_name TEXT NOT NULL DEFAULT 'CUSTOM',
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  createRolePermissionsTable: `
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY (role_id, permission_id)
    );
  `,
} as const;

const DEFAULT_ROLE_DESCRIPTIONS: Record<Role, string> = {
  [Role.ADMIN]: 'Full system access and configuration control',
  [Role.CEO]: 'Executive oversight and high-level reporting',
  [Role.MANAGER]: 'Departmental management and approval authority',
  [Role.HR]: 'Human resources and personnel management',
  [Role.ACCOUNT_MANAGER]: 'Client relationship and project coordination',
  [Role.ACCOUNTING]: 'Financial tracking, invoicing, and expenses',
  [Role.DEVELOPER]: 'Software development and technical operations',
  [Role.SOCIAL_MEDIA]: 'Social media management and content posting',
  [Role.CREATIVE]: 'Graphic design and creative content generation',
  [Role.MARKETING]: 'Marketing campaigns and strategy planning',
  [Role.PRODUCTION]: 'Video/audio production and media operations',
  [Role.CLIENT]: 'External client access to specific projects',
};

const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission),
  [Role.CEO]: Object.values(Permission),
  [Role.MANAGER]: [
    Permission.USERS_READ,
    Permission.USERS_UPDATE,
    Permission.CLIENTS_READ,
    Permission.PROJECTS_READ,
    Permission.PROJECTS_CREATE,
    Permission.PROJECTS_UPDATE,
    Permission.TASKS_READ,
    Permission.TASKS_CREATE,
    Permission.TASKS_UPDATE,
    Permission.TIME_ENTRIES_READ,
    Permission.TICKETS_READ,
    Permission.TICKETS_UPDATE,
    Permission.INVOICES_READ,
    Permission.EXPENSES_READ,
    Permission.CONTRACTS_READ,
    Permission.MEETINGS_READ,
    Permission.FILES_READ,
    Permission.NOTIFICATIONS_READ,
  ],
  [Role.ACCOUNTING]: [
    Permission.CLIENTS_READ,
    Permission.PROJECTS_READ,
    Permission.INVOICES_READ,
    Permission.INVOICES_CREATE,
    Permission.INVOICES_UPDATE,
    Permission.PAYMENTS_READ,
    Permission.PAYMENTS_CREATE,
    Permission.EXPENSES_READ,
    Permission.EXPENSES_CREATE,
    Permission.EXPENSES_UPDATE,
    Permission.NOTIFICATIONS_READ,
  ],
  [Role.DEVELOPER]: [
    Permission.PROJECTS_READ,
    Permission.TASKS_READ,
    Permission.TASKS_UPDATE,
    Permission.TIME_ENTRIES_READ,
    Permission.TIME_ENTRIES_CREATE,
    Permission.TIME_ENTRIES_UPDATE,
    Permission.FILES_READ,
    Permission.FILES_UPLOAD,
    Permission.NOTIFICATIONS_READ,
  ],
  [Role.SOCIAL_MEDIA]: [
    Permission.PROJECTS_READ,
    Permission.TASKS_READ,
    Permission.TASKS_UPDATE,
    Permission.FILES_READ,
    Permission.FILES_UPLOAD,
    Permission.NOTIFICATIONS_READ,
  ],
  [Role.CREATIVE]: [
    Permission.PROJECTS_READ,
    Permission.TASKS_READ,
    Permission.TASKS_UPDATE,
    Permission.FILES_READ,
    Permission.FILES_UPLOAD,
    Permission.NOTIFICATIONS_READ,
  ],
  [Role.MARKETING]: [
    Permission.PROJECTS_READ,
    Permission.TASKS_READ,
    Permission.TASKS_UPDATE,
    Permission.FILES_READ,
    Permission.NOTIFICATIONS_READ,
  ],
  [Role.PRODUCTION]: [
    Permission.PROJECTS_READ,
    Permission.TASKS_READ,
    Permission.TASKS_UPDATE,
    Permission.FILES_READ,
    Permission.FILES_UPLOAD,
    Permission.NOTIFICATIONS_READ,
  ],
  [Role.ACCOUNT_MANAGER]: [
    Permission.USERS_READ,
    Permission.CLIENTS_READ,
    Permission.CLIENTS_UPDATE,
    Permission.PROJECTS_READ,
    Permission.PROJECTS_CREATE,
    Permission.PROJECTS_UPDATE,
    Permission.TASKS_READ,
    Permission.TASKS_CREATE,
    Permission.TASKS_UPDATE,
    Permission.TICKETS_READ,
    Permission.TICKETS_CREATE,
    Permission.CONTRACTS_READ,
    Permission.MEETINGS_READ,
    Permission.MEETINGS_CREATE,
    Permission.FILES_READ,
    Permission.FILES_UPLOAD,
    Permission.NOTIFICATIONS_READ,
  ],
  [Role.HR]: [
    Permission.USERS_READ,
    Permission.USERS_CREATE,
    Permission.USERS_UPDATE,
    Permission.PROJECTS_READ,
    Permission.TASKS_READ,
    Permission.MEETINGS_READ,
    Permission.NOTIFICATIONS_READ,
  ],
  [Role.CLIENT]: [
    Permission.CLIENTS_READ,
    Permission.PROJECTS_READ,
    Permission.TASKS_READ,
    Permission.CONTRACTS_READ,
    Permission.MEETINGS_READ,
    Permission.FILES_READ,
    Permission.NOTIFICATIONS_READ,
  ],
};

export function getDefaultRoleRows(): Array<{
  name: string;
  description: string;
}> {
  return Object.values(Role).map((role) => ({
    name: role,
    description: DEFAULT_ROLE_DESCRIPTIONS[role] ?? 'System role',
  }));
}

export function getDefaultPermissionRows(): Array<{
  name: string;
  group: string;
  description: string;
}> {
  return Object.values(Permission).map((permission) => {
    const parts = permission.split('_');
    const action = (parts.pop() ?? 'READ').toLowerCase();
    const group = parts.join('_') || 'CUSTOM';

    return {
      name: permission,
      group,
      description: `Permission to ${action} ${group.toLowerCase().replace(/_/g, ' ')}`,
    };
  });
}

export function getDefaultRolePermissionRows(): Array<{
  roleName: string;
  permissionName: string;
}> {
  const rows: Array<{ roleName: string; permissionName: string }> = [];

  for (const [roleName, permissions] of Object.entries(
    DEFAULT_ROLE_PERMISSIONS,
  )) {
    for (const permissionName of permissions) {
      rows.push({ roleName, permissionName });
    }
  }

  return rows;
}
