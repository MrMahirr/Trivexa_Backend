import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Role } from '../../../shared/enums/role.enum';
import { MeetingsService } from '../application/meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { ConvertToTicketDto } from './dto/convert-to-ticket.dto';
import { MeetingAccessContext } from '../infrastructure/meetings.repository';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Meetings')
@ApiBearerAuth()
@Controller('meetings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  private isManagerRole(user: any): boolean {
    const role = String(user?.role ?? '').toUpperCase();
    return (
      (role as unknown as Role) === Role.ADMIN ||
      (role as unknown as Role) === Role.CEO ||
      (role as unknown as Role) === Role.MANAGER ||
      (role as unknown as Role) === Role.ACCOUNT_MANAGER ||
      (role as unknown as Role) === Role.HR
    );
  }

  private toAccessContext(user: any): MeetingAccessContext {
    const role = String(user?.role ?? '').toUpperCase();
    return {
      userId: user?.userId,
      role,
      department: user?.department ?? null,
      canViewAll: (role as unknown as Role) === Role.ADMIN,
      isManager: this.isManagerRole(user),
    };
  }

  @ApiOperation({ summary: 'Create a new meeting' })
  @ApiResponse({
    status: 201,
    description: 'The meeting has been successfully created.',
  })
  @Post()
  @Roles(Role.ADMIN, Role.CEO, Role.MANAGER, Role.ACCOUNT_MANAGER, Role.HR)
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
    return this.meetingsService.findAll(
      { clientId, projectId },
      this.toAccessContext(user),
    );
  }

  @ApiOperation({ summary: 'Get meeting by ID' })
  @ApiResponse({ status: 200, description: 'Return meeting by ID.' })
  @ApiResponse({ status: 404, description: 'Meeting not found.' })
  @Get(':id')
  async findById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.meetingsService.findByIdForUser(id, this.toAccessContext(user));
  }

  @ApiOperation({ summary: 'Update a meeting' })
  @ApiResponse({ status: 200, description: 'Meeting updated successfully.' })
  @ApiResponse({ status: 404, description: 'Meeting not found.' })
  @Put(':id')
  @Roles(Role.ADMIN, Role.CEO, Role.MANAGER, Role.ACCOUNT_MANAGER, Role.HR)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMeetingDto,
    @CurrentUser() user: any,
  ) {
    return this.meetingsService.update(id, dto, user.userId);
  }

  @ApiOperation({ summary: 'Convert a meeting to a Ticket' })
  @ApiResponse({ status: 201, description: 'Ticket generated from meeting.' })
  @Post(':id/convert-to-ticket')
  @Roles(Role.ADMIN, Role.CEO, Role.MANAGER, Role.ACCOUNT_MANAGER, Role.HR)
  async convertToTicket(
    @Param('id') id: string,
    @Body() dto: ConvertToTicketDto,
    @CurrentUser() user: any,
  ) {
    return this.meetingsService.convertToTicket(id, dto, user.userId);
  }
}
