import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../shared/enums/role.enum';
import { PerformanceService } from '../application/performance.service';
import { PerformanceQueryDto } from './dto/performance-query.dto';
import { UpsertPerformanceDto } from './dto/upsert-performance.dto';

@ApiTags('Performance')
@ApiBearerAuth()
@Controller('performance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @ApiOperation({ summary: 'List performance reviews' })
  @ApiResponse({ status: 200, description: 'Return performance reviews.' })
  @Get()
  @Roles(Role.ADMIN, Role.CEO, Role.MANAGER, Role.HR)
  async findAll(@Query() query: PerformanceQueryDto) {
    return this.performanceService.findAll(query);
  }

  @ApiOperation({ summary: 'Create or update performance review' })
  @ApiResponse({ status: 201, description: 'Performance review saved.' })
  @Post()
  @Roles(Role.ADMIN, Role.CEO, Role.MANAGER, Role.HR)
  async upsert(@Body() dto: UpsertPerformanceDto, @CurrentUser() user: any) {
    return this.performanceService.upsert(dto, user);
  }
}
