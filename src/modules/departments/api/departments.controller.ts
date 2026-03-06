import {
  Inject,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Body,
  UseGuards,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import {
  CACHE_MANAGER,
  Cache,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DepartmentsListResponseDto, DepartmentSingleResponseDto } from './dto/response/departments-response.dto';
import { GetDepartmentsUseCase } from '../application/usecases/get-departments.usecase';
import { CreateDepartmentUseCase } from '../application/usecases/create-department.usecase';
import { UpdateDepartmentUseCase } from '../application/usecases/update-department.usecase';
import { CreateDepartmentModuleUseCase } from '../application/usecases/create-department-module.usecase';
import { UpdateDepartmentModuleUseCase } from '../application/usecases/update-department-module.usecase';
import { DeleteDepartmentModuleUseCase } from '../application/usecases/delete-department-module.usecase';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreateDepartmentModuleDto } from './dto/create-department-module.dto';
import { UpdateDepartmentModuleDto } from './dto/update-department-module.dto';
import { DepartmentsRepository } from '../infrastructure/repositories/department.repository';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../shared/enums/role.enum';
import { DepartmentNotFoundException } from '../domain/department.errors';

@ApiTags('Departments')
@ApiBearerAuth('access-token')
@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  private readonly logger = new Logger(DepartmentsController.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly getDepartmentsUseCase: GetDepartmentsUseCase,
    private readonly createDepartmentUseCase: CreateDepartmentUseCase,
    private readonly updateDepartmentUseCase: UpdateDepartmentUseCase,
    private readonly createDepartmentModuleUseCase: CreateDepartmentModuleUseCase,
    private readonly updateDepartmentModuleUseCase: UpdateDepartmentModuleUseCase,
    private readonly deleteDepartmentModuleUseCase: DeleteDepartmentModuleUseCase,
    private readonly departmentsRepo: DepartmentsRepository,
  ) {}

  private async invalidateDepartmentsCache(): Promise<void> {
    try {
      await this.cacheManager.del('all_departments');
    } catch (error) {
      this.logger.warn(`Failed to invalidate all_departments cache: ${error}`);
    }
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('all_departments')
  @CacheTTL(300000) // 5 minutes cache
  @ApiOperation({ summary: 'List all departments' })
  @ApiResponse({ status: 200, description: 'Return all departments.', type: DepartmentsListResponseDto })
  async findAll() {
    return this.getDepartmentsUseCase.execute();
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000) // 1 minute cache for specific item
  @ApiOperation({ summary: 'Get department details' })
  @ApiResponse({ status: 200, description: 'Return department details.', type: DepartmentSingleResponseDto })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  async findOne(@Param('id') id: string) {
    const department = await this.departmentsRepo.findById(id);
    if (!department) {
      throw new DepartmentNotFoundException(id);
    }
    return department;
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department successfully created.', type: DepartmentSingleResponseDto })
  async create(@Body() dto: CreateDepartmentDto) {
    const created = await this.createDepartmentUseCase.execute(dto);
    await this.invalidateDepartmentsCache();
    return created;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({ status: 200, description: 'Department successfully updated.', type: DepartmentSingleResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    const updated = await this.updateDepartmentUseCase.execute(id, dto);
    await this.invalidateDepartmentsCache();
    return updated;
  }

  @Post(':id/modules')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create department sub-module' })
  @ApiResponse({ status: 201, description: 'Department sub-module created.' })
  async createModule(
    @Param('id') departmentId: string,
    @Body() dto: CreateDepartmentModuleDto,
  ) {
    const created = await this.createDepartmentModuleUseCase.execute(
      departmentId,
      dto,
    );
    await this.invalidateDepartmentsCache();
    return created;
  }

  @Patch('modules/:moduleId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update department sub-module' })
  @ApiResponse({ status: 200, description: 'Department sub-module updated.' })
  async updateModule(
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateDepartmentModuleDto,
  ) {
    const updated = await this.updateDepartmentModuleUseCase.execute(
      moduleId,
      dto,
    );
    await this.invalidateDepartmentsCache();
    return updated;
  }

  @Delete('modules/:moduleId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete department sub-module' })
  @ApiResponse({ status: 200, description: 'Department sub-module deleted.' })
  async deleteModule(@Param('moduleId') moduleId: string) {
    await this.deleteDepartmentModuleUseCase.execute(moduleId);
    await this.invalidateDepartmentsCache();
    return { success: true };
  }
}
