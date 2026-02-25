import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetRolesUseCase } from '../application/usecases/get-roles.usecase';
import { GetPermissionsUseCase } from '../application/usecases/get-permissions.usecase';
import { RolesRepository } from '../infrastructure/repositories/role.repository';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../shared/enums/role.enum';
import { RoleNotFoundException } from '../domain/role.errors';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(
    private readonly getRolesUseCase: GetRolesUseCase,
    private readonly getPermissionsUseCase: GetPermissionsUseCase,
    private readonly rolesRepo: RolesRepository,
  ) { }

  @Get('roles')
  @ApiOperation({ summary: 'List all system roles' })
  @ApiResponse({ status: 200, description: 'Return all roles.' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseInterceptors(CacheInterceptor)
  @CacheKey('all_roles')
  @CacheTTL(300000) // 5 minutes cache
  async getRoles() {
    return this.getRolesUseCase.execute();
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Get role details' })
  @ApiResponse({ status: 200, description: 'Return role details.' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000) // 1 minute cache
  async getRole(@Param('id') id: string) {
    const role = await this.rolesRepo.findById(id);
    if (!role) {
      throw new RoleNotFoundException(id);
    }
    return role;
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List all system permissions' })
  @ApiResponse({ status: 200, description: 'Return all permissions.' })
  @Roles(Role.ADMIN)
  @UseInterceptors(CacheInterceptor)
  @CacheKey('all_permissions')
  @CacheTTL(300000) // 5 minutes
  async getPermissions() {
    return this.getPermissionsUseCase.execute();
  }
}
