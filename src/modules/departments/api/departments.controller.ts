import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Body,
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
import { GetDepartmentsUseCase } from '../application/usecases/get-departments.usecase';
import { CreateDepartmentUseCase } from '../application/usecases/create-department.usecase';
import { UpdateDepartmentUseCase } from '../application/usecases/update-department.usecase';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentsRepository } from '../infrastructure/repositories/department.repository';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../shared/enums/role.enum';
import { DepartmentNotFoundException } from '../domain/department.errors';

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(
    private readonly getDepartmentsUseCase: GetDepartmentsUseCase,
    private readonly createDepartmentUseCase: CreateDepartmentUseCase,
    private readonly updateDepartmentUseCase: UpdateDepartmentUseCase,
    private readonly departmentsRepo: DepartmentsRepository,
  ) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('all_departments')
  @CacheTTL(300000) // 5 minutes cache
  @ApiOperation({ summary: 'List all departments' })
  @ApiResponse({ status: 200, description: 'Return all departments.' })
  async findAll() {
    return this.getDepartmentsUseCase.execute();
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000) // 1 minute cache for specific item
  @ApiOperation({ summary: 'Get department details' })
  @ApiResponse({ status: 200, description: 'Return department details.' })
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
  @ApiResponse({ status: 201, description: 'Department successfully created.' })
  async create(@Body() dto: CreateDepartmentDto) {
    return this.createDepartmentUseCase.execute(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({ status: 200, description: 'Department successfully updated.' })
  async update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.updateDepartmentUseCase.execute(id, dto);
  }
}
