import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GenerateFinancialReportUseCase } from '../application/usecases/generate-financial-report.usecase';
import { GenerateProjectAnalyticsUseCase } from '../application/usecases/generate-project-analytics.usecase';
import { GenerateFinancialReportDto } from './dto/generate-financial-report.dto';
import { GenerateProjectAnalyticsDto } from './dto/generate-project-analytics.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../shared/enums/role.enum';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
    constructor(
        private readonly generateFinancialReportUseCase: GenerateFinancialReportUseCase,
        private readonly generateProjectAnalyticsUseCase: GenerateProjectAnalyticsUseCase,
    ) { }

    @Get('financial')
    @Roles(Role.ADMIN, Role.MANAGER)
    async getFinancialReport(@Query() query: GenerateFinancialReportDto) {
        return this.generateFinancialReportUseCase.execute(query);
    }

    @Get('projects')
    @Roles(Role.ADMIN, Role.MANAGER)
    async getProjectAnalytics(@Query() query: GenerateProjectAnalyticsDto) {
        return this.generateProjectAnalyticsUseCase.execute(query);
    }
}
