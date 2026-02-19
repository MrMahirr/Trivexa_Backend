import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Role } from '../../../../shared/enums/role.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from '../application/payments.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @ApiOperation({ summary: 'Create a new payment' })
    @ApiResponse({ status: 201, description: 'The payment has been successfully created.' })
    @Post()
    @Roles(Role.ADMIN, Role.MANAGER)
    async create(@Body() createPaymentDto: CreatePaymentDto, @CurrentUser() user: any) {
        return this.paymentsService.create(createPaymentDto, user.userId);
    }

    @ApiOperation({ summary: 'Get payments by invoice ID' })
    @ApiResponse({ status: 200, description: 'Return payments for the invoice.' })
    @Get('invoice/:invoiceId')
    @Roles(Role.ADMIN, Role.MANAGER)
    async getByInvoice(@Param('invoiceId') invoiceId: string) {
        return this.paymentsService.getPaymentsByInvoice(invoiceId);
    }
}
