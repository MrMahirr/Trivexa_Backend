import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Role } from '../../../shared/enums/role.enum';
import { CreateContractDto } from './dto/create-contract.dto';
import { ContractsService } from '../application/contracts.service';
import { ContractStatus } from '../domain/contract.entity';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
    constructor(private readonly contractsService: ContractsService) { }

    @Post()
    @Roles(Role.ADMIN, Role.MANAGER)
    async create(@Body() createContractDto: CreateContractDto, @CurrentUser() user: any) {
        return this.contractsService.create(createContractDto, user.userId);
    }

    @Get()
    @Roles(Role.ADMIN, Role.MANAGER)
    async findAll(@Query('clientId') clientId?: string, @Query('status') status?: ContractStatus) {
        return this.contractsService.findAll({ clientId, status });
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.MANAGER)
    async findById(@Param('id') id: string) {
        return this.contractsService.findById(id);
    }

    @Patch(':id/approve')
    @Roles(Role.ADMIN, Role.MANAGER)
    async approve(@Param('id') id: string) {
        return this.contractsService.approve(id);
    }

    @Patch(':id/sign')
    @Roles(Role.ADMIN, Role.MANAGER)
    async sign(@Param('id') id: string, @Body('signedUrl') signedUrl: string) {
        return this.contractsService.sign(id, signedUrl);
    }
}
