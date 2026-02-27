export interface DepartmentEntity {
  id: string;   // UUID
  name: string; // Tasarım, Yazılım vb.
  description?: string;
  managerId?: string; // İlgili departmanın yöneticisi (user_id)
  createdAt: Date;
  updatedAt: Date;
}

export class DepartmentModel implements DepartmentEntity {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
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
