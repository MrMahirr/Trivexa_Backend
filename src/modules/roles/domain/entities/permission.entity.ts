import { Permission } from '../../../../shared/enums/permission.enum';

export class PermissionEntity {
  constructor(
    public id: Permission,
    public name: string,
    public group: string,
    public description: string,
  ) {}

  static fromEnum(permission: Permission): PermissionEntity {
    const parts = permission.split('_');
    const action = parts.pop();
    const group = parts.join(' ');

    return new PermissionEntity(
      permission,
      permission.replace(/_/g, ' '),
      group,
      `Permission to ${action?.toLowerCase()} ${group.toLowerCase()}`,
    );
  }
}
