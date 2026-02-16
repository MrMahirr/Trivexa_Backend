import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Role } from '../../../../shared/enums/role.enum';
import { ExpensesService } from '../application/expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Post()
    @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
    async create(@Body() createExpenseDto: CreateExpenseDto, @CurrentUser() user: any) {
        return this.expensesService.create(createExpenseDto, user.userId);
    }

    @Get()
    @Roles(Role.ADMIN, Role.MANAGER)
    async findAll() {
        return this.expensesService.findAll();
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
    async findOne(@Param('id') id: string) {
        return this.expensesService.findById(id);
    }

    @Patch(':id/approve')
    @Roles(Role.ADMIN, Role.MANAGER)
    async approve(@Param('id') id: string, @CurrentUser() user: any) {
        return this.expensesService.approve(id, user.userId);
    }

    @Patch(':id/reject')
    @Roles(Role.ADMIN, Role.MANAGER)
    async reject(@Param('id') id: string, @CurrentUser() user: any) {
        return this.expensesService.reject(id, user.userId);
    }
}
