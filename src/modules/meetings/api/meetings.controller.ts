import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { MeetingsService } from '../application/meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { ConvertToTicketDto } from './dto/convert-to-ticket.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Meetings')
@ApiBearerAuth()
@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) { }

  @ApiOperation({ summary: 'Create a new meeting' })
  @ApiResponse({
    status: 201,
    description: 'The meeting has been successfully created.',
  })
  @Post()
  async create(
    @Body() createMeetingDto: CreateMeetingDto,
    @CurrentUser() user: any,
  ) {
    return this.meetingsService.create(createMeetingDto, user.userId);
  }

  @ApiOperation({ summary: 'Get all meetings' })
  @ApiResponse({ status: 200, description: 'Return all meetings.' })
  @Get()
  async findAll(
    @Query('clientId') clientId?: string,
    @Query('projectId') projectId?: string,
    @CurrentUser() user?: any,
  ) {
    // Optionally filter by organizer = user.userId if not admin?
    return this.meetingsService.findAll({ clientId, projectId });
  }

  @ApiOperation({ summary: 'Get meeting by ID' })
  @ApiResponse({ status: 200, description: 'Return meeting by ID.' })
  @ApiResponse({ status: 404, description: 'Meeting not found.' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.meetingsService.findById(id);
  }

  @ApiOperation({ summary: 'Convert a meeting to a Ticket' })
  @ApiResponse({ status: 201, description: 'Ticket generated from meeting.' })
  @Post(':id/convert-to-ticket')
  async convertToTicket(
    @Param('id') id: string,
    @Body() dto: ConvertToTicketDto,
    @CurrentUser() user: any
  ) {
    return this.meetingsService.convertToTicket(id, dto, user.userId);
  }
}
