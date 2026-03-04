import { Role } from '../../../../shared/enums/role.enum';

export class RoleEntity {
  constructor(
    public id: Role,
    public name: string,
    public description: string,
  ) {}

  static fromEnum(role: Role): RoleEntity {
    const descriptionMap: Record<Role, string> = {
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

    return new RoleEntity(
      role,
      role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(),
      descriptionMap[role] || 'System Role',
    );
  }
}
