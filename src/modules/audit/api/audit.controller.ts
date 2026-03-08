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
import { Role } from '../../../shared/enums/role.enum';
import { ListAuditLogsUseCase } from '../application/usecases/list-audit-logs.usecase';
import { ListAuditQueryDto } from './dto/list-audit.query';
import { PageDto } from '../../../shared/dto/page.dto';
import { AuditLog } from '../domain/entities/audit-log.entity';
import { RunAuditRetentionUseCase } from '../application/usecases/run-audit-retention.usecase';
import { AuditRetentionDto } from './dto/audit-retention.dto';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(Role.ADMIN) // Only admins can see audit logs
export class AuditController {
  constructor(
    private readonly listAuditLogsUseCase: ListAuditLogsUseCase,
    private readonly runAuditRetentionUseCase: RunAuditRetentionUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs with pagination' })
  @ApiResponse({ status: 200, description: 'Return audit logs.' })
  async getAuditLogs(
    @Query() query: ListAuditQueryDto,
  ): Promise<PageDto<AuditLog>> {
    return this.listAuditLogsUseCase.execute(query);
  }

  @Post('maintenance/archive-old')
  @ApiOperation({ summary: 'Archive and purge old audit logs' })
  @ApiResponse({ status: 200, description: 'Archive maintenance completed.' })
  async archiveOldLogs(@Body() body: AuditRetentionDto) {
    return this.runAuditRetentionUseCase.execute(body.retentionDays ?? 180);
  }
}
