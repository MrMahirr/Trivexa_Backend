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

@Controller('time-entries')
@UseGuards(JwtAuthGuard)
export class TimeTrackingController {
  constructor(private readonly timeService: TimeTrackingService) {}

  @Post('start')
  async startTimer(@Body() dto: StartTimeEntryDto, @CurrentUser() user: any) {
    return this.timeService.startTimer(user.userId, dto);
  }

  @Patch('stop')
  async stopTimer(@CurrentUser() user: any) {
    return this.timeService.stopTimer(user.userId);
  }

  @Get('active')
  async getActiveTimer(@CurrentUser() user: any) {
    return this.timeService.getActiveTimer(user.userId);
  }

  @Post()
  async createManual(
    @Body() dto: CreateTimeEntryDto,
    @CurrentUser() user: any,
  ) {
    return this.timeService.createManualEntry(user.userId, dto);
  }

  @Get()
  async findAll(@Query() query: TimeEntryQueryDto, @CurrentUser() user: any) {
    return this.timeService.findAll(query, user.userId, user.role);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.timeService.approve(id);
  }
}
