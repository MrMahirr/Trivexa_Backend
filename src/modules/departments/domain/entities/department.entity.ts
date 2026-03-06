export interface DepartmentModuleEntity {
  id: string;
  departmentId: string;
  name: string;
  description?: string;
  teamLeadId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentEntity {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  modules?: DepartmentModuleEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export class DepartmentModel implements DepartmentEntity {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  modules?: DepartmentModuleEntity[];
  createdAt: Date;
  updatedAt: Date;

  static fromRow(row: any): DepartmentModel {
    const entity = new DepartmentModel();
    entity.id = row.id;
    entity.name = row.name;
    entity.description = row.description;
    entity.managerId = row.manager_id;
    entity.createdAt = row.created_at;
    entity.updatedAt = row.updated_at;
    return entity;
  }
}

export class DepartmentModuleModel implements DepartmentModuleEntity {
  id: string;
  departmentId: string;
  name: string;
  description?: string;
  teamLeadId?: string;
  createdAt: Date;
  updatedAt: Date;

  static fromRow(row: any): DepartmentModuleModel {
    const entity = new DepartmentModuleModel();
    entity.id = row.id;
    entity.departmentId = row.department_id;
    entity.name = row.name;
    entity.description = row.description;
    entity.teamLeadId = row.team_lead_id;
    entity.createdAt = row.created_at;
    entity.updatedAt = row.updated_at;
    return entity;
  }
}
