import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Role } from '../../../../shared/enums/role.enum';
import { ExpensesService } from '../application/expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) { }

  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({
    status: 201,
    description: 'The expense has been successfully created.',
  })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  async create(
    @Body() createExpenseDto: CreateExpenseDto,
    @CurrentUser() user: any,
  ) {
    return this.expensesService.create(createExpenseDto, user.userId);
  }

  @ApiOperation({ summary: 'Get all expenses' })
  @ApiResponse({ status: 200, description: 'Return all expenses.' })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  async findAll() {
    return this.expensesService.findAll();
  }

  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiResponse({ status: 200, description: 'Return expense by ID.' })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  async findOne(@Param('id') id: string) {
    return this.expensesService.findById(id);
  }

  @ApiOperation({ summary: 'Approve expense' })
  @ApiResponse({ status: 200, description: 'Expense approved successfully.' })
  @Patch(':id/approve')
  @Roles(Role.ADMIN, Role.MANAGER)
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.expensesService.approve(id, user.userId);
  }

  @ApiOperation({ summary: 'Reject expense' })
  @ApiResponse({ status: 200, description: 'Expense rejected successfully.' })
  @Patch(':id/reject')
  @Roles(Role.ADMIN, Role.MANAGER)
  async reject(@Param('id') id: string, @CurrentUser() user: any) {
    return this.expensesService.reject(id, user.userId);
  }
}
