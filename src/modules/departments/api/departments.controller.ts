import { Controller, Get, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetDepartmentsUseCase } from '../application/usecases/get-departments.usecase';
import { DepartmentsRepository } from '../infrastructure/repositories/department.repository';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
    constructor(
        private readonly getDepartmentsUseCase: GetDepartmentsUseCase,
        private readonly departmentsRepo: DepartmentsRepository // Simple lookup direct from repo for byId
    ) { }

    @Get()
    @ApiOperation({ summary: 'List all departments' })
    @ApiResponse({ status: 200, description: 'Return all departments.' })
    async findAll() {
        return this.getDepartmentsUseCase.execute();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get department details' })
    @ApiResponse({ status: 200, description: 'Return department details.' })
    @ApiResponse({ status: 404, description: 'Department not found.' })
    async findOne(@Param('id') id: string) {
        const department = await this.departmentsRepo.findById(id);
        if (!department) {
            throw new NotFoundException(`Department with ID "${id}" not found`);
        }
        return department;
    }
}
