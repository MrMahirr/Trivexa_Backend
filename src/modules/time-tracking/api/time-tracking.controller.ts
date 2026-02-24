import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TimeTrackingService } from '../application/time-tracking.service';
import { StartTimeEntryDto } from './dto/start-time-entry.dto';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { TimeEntryQueryDto } from './dto/time-entry-query.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Time Tracking')
@ApiBearerAuth()
@Controller('time-entries')
@UseGuards(JwtAuthGuard)
export class TimeTrackingController {
  constructor(private readonly timeService: TimeTrackingService) { }

  @ApiOperation({ summary: 'Start a new time entry' })
  @ApiResponse({ status: 201, description: 'Timer started.' })
  @Post('start')
  async startTimer(@Body() dto: StartTimeEntryDto, @CurrentUser() user: any) {
    return this.timeService.startTimer(user.userId, dto);
  }

  @ApiOperation({ summary: 'Stop the active time entry' })
  @ApiResponse({ status: 200, description: 'Timer stopped.' })
  @Patch('stop')
  async stopTimer(@CurrentUser() user: any) {
    return this.timeService.stopTimer(user.userId);
  }

  @ApiOperation({ summary: 'Get the currently active time entry' })
  @ApiResponse({ status: 200, description: 'Active timer retrieved.' })
  @Get('active')
  async getActiveTimer(@CurrentUser() user: any) {
    return this.timeService.getActiveTimer(user.userId);
  }

  @ApiOperation({ summary: 'Create a manual time entry' })
  @ApiResponse({ status: 201, description: 'Manual time entry created.' })
  @Post()
  async createManual(
    @Body() dto: CreateTimeEntryDto,
    @CurrentUser() user: any,
  ) {
    return this.timeService.createManualEntry(user.userId, dto);
  }

  @ApiOperation({ summary: 'Get all time entries' })
  @ApiResponse({ status: 200, description: 'Return time entries list.' })
  @Get()
  async findAll(@Query() query: TimeEntryQueryDto, @CurrentUser() user: any) {
    return this.timeService.findAll(query, user.userId, user.role);
  }

  @ApiOperation({ summary: 'Approve a time entry' })
  @ApiResponse({ status: 200, description: 'Time entry approved by Manager/Admin.' })
  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.timeService.approve(id);
  }
}
