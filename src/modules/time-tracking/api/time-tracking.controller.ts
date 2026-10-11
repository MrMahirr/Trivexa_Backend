import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TimeTrackingService } from '../application/time-tracking.service';
import { StartTimerDto } from './dto/start-timer.dto';
import { StopTimerDto } from './dto/stop-timer.dto';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { TimeEntryQueryDto } from './dto/time-entry-query.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Time Tracking')
@ApiBearerAuth()
@Controller('time-entries')
@UseGuards(JwtAuthGuard)
export class TimeTrackingController {
  constructor(private readonly timeService: TimeTrackingService) {}

  @ApiOperation({ summary: 'Start a new time entry' })
  @ApiResponse({ status: 201, description: 'Timer started.' })
  @Post('start')
  async startTimer(@Body() dto: StartTimerDto, @CurrentUser() user: any) {
    return this.timeService.startTimer(user.userId, dto);
  }

  @ApiOperation({ summary: 'Stop the active time entry' })
  @ApiResponse({ status: 200, description: 'Timer stopped.' })
  @Patch('stop')
  async stopTimer(@Body() dto: StopTimerDto, @CurrentUser() user: any) {
    return this.timeService.stopTimer(user.userId, dto);
  }

  @ApiOperation({ summary: 'Cancel/Delete a time entry' })
  @ApiResponse({ status: 200, description: 'Timer entry cancelled securely.' })
  @Patch(':id/cancel')
  async cancelEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    const isAdmin =
      user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'CEO';
    return this.timeService.cancelEntry(id, user.userId, isAdmin);
  }

  @ApiOperation({ summary: 'Delete a time entry from history' })
  @ApiResponse({ status: 200, description: 'Time entry deleted.' })
  @Delete(':id')
  async deleteEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    const isAdmin =
      user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'CEO';
    return this.timeService.deleteEntry(id, user.userId, isAdmin);
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
  @ApiResponse({
    status: 200,
    description: 'Time entry approved by Manager/Admin.',
  })
  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.timeService.approve(id);
  }
}
