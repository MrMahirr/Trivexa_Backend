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
import { TicketsService } from '../application/tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({
    status: 201,
    description: 'The ticket has been successfully created.',
  })
  @Post()
  async create(@Body() dto: CreateTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.create(dto, user.userId);
  }

  @ApiOperation({ summary: 'Get all tickets' })
  @ApiResponse({ status: 200, description: 'Return all tickets.' })
  @Get()
  async findAll(@Query() query: TicketQueryDto, @CurrentUser() user: any) {
    return this.ticketsService.findAll(query, user.userId, user.role);
  }

  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiResponse({ status: 200, description: 'Return ticket by ID.' })
  @ApiResponse({ status: 404, description: 'Ticket not found.' })
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.findById(id);
  }

  @ApiOperation({ summary: 'Update ticket status' })
  @ApiResponse({ status: 200, description: 'Ticket status updated.' })
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.ticketsService.updateStatus(id, status);
  }

  @ApiOperation({ summary: 'Assign ticket to user' })
  @ApiResponse({ status: 200, description: 'Ticket assigned successfully.' })
  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketsService.assign(id, dto.assigneeId, user.userId);
  }

  @ApiOperation({ summary: 'Approve / Resolve a ticket' })
  @ApiResponse({ status: 200, description: 'Ticket resolved successfully.' })
  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ticketsService.approve(id, user.userId);
  }
}
