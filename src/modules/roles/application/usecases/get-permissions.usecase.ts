import { Injectable } from '@nestjs/common';
import { PermissionsRepository } from '../../infrastructure/repositories/permission.repository';

@Injectable()
export class GetPermissionsUseCase {
    constructor(private readonly permissionsRepo: PermissionsRepository) { }

    async execute() {
        return this.permissionsRepo.findAll();
    }
}
