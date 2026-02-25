import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
  UseInterceptors,
  Post,
  Put,
  Body,
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
import { CreateRoleUseCase } from '../application/usecases/create-role.usecase';
import { UpdateRoleUseCase } from '../application/usecases/update-role.usecase';
import { AssignPermissionsUseCase } from '../application/usecases/assign-permissions.usecase';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
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
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly assignPermissionsUseCase: AssignPermissionsUseCase,
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

  @Post('roles')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role successfully created.' })
  @Roles(Role.ADMIN)
  async createRole(@Body() dto: CreateRoleDto, @CurrentUser() user: any) {
    return this.createRoleUseCase.execute(dto, user.userId);
  }

  @Put('roles/:id')
  @ApiOperation({ summary: 'Update an existing role' })
  @ApiResponse({ status: 200, description: 'Role successfully updated.' })
  @Roles(Role.ADMIN)
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: any,
  ) {
    return this.updateRoleUseCase.execute(id, dto, user.userId);
  }

  @Post('roles/assign-permissions')
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiResponse({ status: 200, description: 'Permissions successfully assigned.' })
  @Roles(Role.ADMIN)
  async assignPermissions(
    @Body() dto: AssignPermissionsDto,
    @CurrentUser() user: any,
  ) {
    return this.assignPermissionsUseCase.execute(dto, user.userId);
  }
}
