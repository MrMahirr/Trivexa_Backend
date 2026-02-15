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
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post()
    async create(@Body() dto: CreateTicketDto, @CurrentUser() user: any) {
        return this.ticketsService.create(dto, user.userId);
    }

    @Get()
    async findAll(@Query() query: TicketQueryDto, @CurrentUser() user: any) {
        return this.ticketsService.findAll(query, user.userId, user.role);
    }

    @Get(':id')
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.ticketsService.findById(id);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('status') status: string,
    ) {
        return this.ticketsService.updateStatus(id, status);
    }

    @Patch(':id/assign')
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    async assign(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('assigneeId', ParseUUIDPipe) assigneeId: string,
    ) {
        return this.ticketsService.assign(id, assigneeId);
    }
}
