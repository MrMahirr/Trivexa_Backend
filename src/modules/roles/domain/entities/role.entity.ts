import { Role } from '../../../../shared/enums/role.enum';

export class RoleEntity {
    constructor(
        public id: Role,
        public name: string,
        public description: string
    ) { }

    static fromEnum(role: Role): RoleEntity {
        const descriptionMap: Record<Role, string> = {
            [Role.ADMIN]: 'Full system access and configuration control',
            [Role.MANAGER]: 'Departmental management and approval authority',
            [Role.MEMBER]: 'Standard user access for daily operations',
            [Role.VIEWER]: 'Read-only access to authorized resources',
            [Role.CLIENT]: 'External client access to specific projects',
        };

        return new RoleEntity(
            role,
            role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(),
            descriptionMap[role] || 'System Role'
        );
    }
}
