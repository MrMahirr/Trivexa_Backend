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
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Role } from '../../../../shared/enums/role.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentAuditQueryDto } from './dto/payment-audit.query.dto';
import { CashflowOverviewQueryDto } from './dto/cashflow-overview.query.dto';
import { ListPaymentsQueryDto } from './dto/list-payments.query.dto';
import { PaymentsService } from '../application/payments.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaymentAuditListResponseDto,
  PaymentsListResponseDto,
  PaymentSingleResponseDto,
} from './dto/response/payments-response.dto';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: 201,
    description: 'The payment has been successfully created.',
    type: PaymentSingleResponseDto
  })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.ACCOUNTING, Role.SOCIAL_MEDIA)
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.create(createPaymentDto, user.userId);
  }

  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({
    status: 200,
    description: 'Return payments list.',
    type: PaymentsListResponseDto,
  })
  @Get()
  @Roles(Role.ADMIN, Role.CEO, Role.MANAGER, Role.ACCOUNTING, Role.SOCIAL_MEDIA, 'SEO')
  async findAll(@Query() query: ListPaymentsQueryDto) {
    return this.paymentsService.getPayments(query);
  }

  @ApiOperation({ summary: 'Get cashflow overview' })
  @ApiResponse({ status: 200, description: 'Return cashflow dashboard overview.' })
  @Get('cashflow/overview')
  @Roles(Role.ADMIN, Role.CEO, Role.MANAGER, Role.ACCOUNTING, Role.SOCIAL_MEDIA, 'SEO')
  async getCashflowOverview(@Query() query: CashflowOverviewQueryDto) {
    return this.paymentsService.getCashflowOverview(query.months);
  }

  @ApiOperation({ summary: 'Get payments by invoice ID' })
  @ApiResponse({ status: 200, description: 'Return payments for the invoice.', type: PaymentsListResponseDto })
  @Get('invoice/:invoiceId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.ACCOUNTING, Role.SOCIAL_MEDIA)
  async getByInvoice(@Param('invoiceId') invoiceId: string) {
    return this.paymentsService.getPaymentsByInvoice(invoiceId);
  }

  @ApiOperation({ summary: 'Update payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment updated successfully.',
    type: PaymentSingleResponseDto,
  })
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.ACCOUNTING, Role.SOCIAL_MEDIA)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.update(id, updatePaymentDto, user.userId);
  }

  @ApiOperation({ summary: 'Delete payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment deleted successfully.' })
  @Delete(':id')
  @Roles(Role.ADMIN, Role.ACCOUNTING, Role.SOCIAL_MEDIA)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    await this.paymentsService.remove(id, user.userId);
    return { success: true };
  }

  @ApiOperation({ summary: 'Create refund for a payment by ID' })
  @ApiResponse({
    status: 201,
    description: 'Refund payment created successfully.',
    type: PaymentSingleResponseDto,
  })
  @Post(':id/refund')
  @Roles(Role.ADMIN, Role.ACCOUNTING, Role.SOCIAL_MEDIA)
  async refund(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() refundPaymentDto: RefundPaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.refund(id, refundPaymentDto, user.userId);
  }

  @ApiOperation({ summary: 'Get payment audit entries by invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Return payment audit entries for the invoice.',
    type: PaymentAuditListResponseDto,
  })
  @Get('invoice/:invoiceId/audit')
  @Roles(Role.ADMIN, Role.MANAGER, Role.ACCOUNTING, Role.SOCIAL_MEDIA)
  async getAuditByInvoice(
    @Param('invoiceId') invoiceId: string,
    @Query() query: PaymentAuditQueryDto,
  ) {
    return this.paymentsService.getAuditByInvoice(invoiceId, query);
  }
}
