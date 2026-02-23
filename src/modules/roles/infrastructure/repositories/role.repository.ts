import { Injectable } from '@nestjs/common';
import { Role } from '../../../../shared/enums/role.enum';
import { RoleEntity } from '../../domain/entities/role.entity';

@Injectable()
export class RolesRepository {
  async findAll(): Promise<RoleEntity[]> {
    return Object.values(Role).map((role) => RoleEntity.fromEnum(role));
  }

  async findById(id: string): Promise<RoleEntity | null> {
    if (!Object.values(Role).includes(id as Role)) {
      return null;
    }
    return RoleEntity.fromEnum(id as Role);
  }
}
