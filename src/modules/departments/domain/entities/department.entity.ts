import { Department } from '../../../../shared/enums/department.enum';

export class DepartmentEntity {
    constructor(
        public id: Department,
        public name: string,
        public description: string
    ) { }

    static fromEnum(dept: Department): DepartmentEntity {
        const descriptionMap: Record<Department, string> = {
            [Department.MANAGEMENT]: 'Executive and strategic management',
            [Department.DESIGN]: 'Creative design and UI/UX',
            [Department.DEVELOPMENT]: 'Software engineering and technical implementation',
            [Department.MARKETING]: 'Brand awareness and lead generation',
            [Department.FINANCE]: 'Financial planning and accounting',
            [Department.HR]: 'Human resources and talent management',
        };

        return new DepartmentEntity(
            dept,
            dept.charAt(0).toUpperCase() + dept.slice(1).toLowerCase(),
            descriptionMap[dept] || 'Department'
        );
    }
}
