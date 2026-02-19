import { Injectable } from '@nestjs/common';
import { Permission } from '../../../../shared/enums/permission.enum';
import { PermissionEntity } from '../../domain/entities/permission.entity';

@Injectable()
export class PermissionsRepository {
    async findAll(): Promise<PermissionEntity[]> {
        return Object.values(Permission).map(perm => PermissionEntity.fromEnum(perm));
    }
}
