import { Injectable } from '@nestjs/common';
import { RolesRepository } from '../../infrastructure/repositories/role.repository';

@Injectable()
export class GetRolesUseCase {
  constructor(private readonly rolesRepo: RolesRepository) {}

  async execute() {
    return this.rolesRepo.findAll();
  }
}
