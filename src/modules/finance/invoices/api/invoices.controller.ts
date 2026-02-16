import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Role } from '../../../../shared/enums/role.enum';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { InvoicesService } from '../application/invoices.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    @Roles(Role.ADMIN, Role.MANAGER)
    async create(@Body() createInvoiceDto: CreateInvoiceDto, @CurrentUser() user: any) {
        return this.invoicesService.create(createInvoiceDto, user.userId);
    }

    @Get()
    @Roles(Role.ADMIN, Role.MANAGER)
    async findAll(@Query() query: InvoiceQueryDto) {
        return this.invoicesService.findAll(query);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.MANAGER)
    async findById(@Param('id') id: string) {
        return this.invoicesService.findById(id);
    }

    @Patch(':id/status')
    @Roles(Role.ADMIN, Role.MANAGER)
    async updateStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateInvoiceStatusDto,
    ) {
        return this.invoicesService.updateStatus(id, updateStatusDto);
    }
}
