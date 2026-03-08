import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Role } from '../../../../shared/enums/role.enum';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { InvoicesService } from '../application/invoices.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InvoicesListResponseDto, InvoiceSingleResponseDto } from './dto/response/invoices-response.dto';
import { StandardResponseDto } from '../../../../shared/dto/api-response.dto';

@ApiTags('Invoices')
@ApiBearerAuth('access-token')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({
    status: 201,
    description: 'The invoice has been successfully created.',
    type: InvoiceSingleResponseDto
  })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.create(createInvoiceDto, user.userId);
  }

  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'Return all invoices.', type: InvoicesListResponseDto })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.ACCOUNTING, Role.SOCIAL_MEDIA)
  async findAll(@Query() query: InvoiceQueryDto) {
    return this.invoicesService.findAll(query);
  }

  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Return invoice by ID.', type: InvoiceSingleResponseDto })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.ACCOUNTING, Role.SOCIAL_MEDIA)
  async findById(@Param('id') id: string) {
    return this.invoicesService.findById(id);
  }

  @ApiOperation({ summary: 'Update invoice status' })
  @ApiResponse({ status: 200, description: 'Invoice status updated.', type: StandardResponseDto })
  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANAGER)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateInvoiceStatusDto,
  ) {
    return this.invoicesService.updateStatus(id, updateStatusDto);
  }
}
