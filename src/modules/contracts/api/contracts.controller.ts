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
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Role } from '../../../shared/enums/role.enum';
import { CreateContractDto } from './dto/create-contract.dto';
import { ContractsService } from '../application/contracts.service';
import { ContractStatus } from '../domain/contract.entity';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Contracts')
@ApiBearerAuth()
@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @ApiOperation({ summary: 'Create a new contract' })
  @ApiResponse({
    status: 201,
    description: 'The contract has been successfully created.',
  })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @Body() createContractDto: CreateContractDto,
    @CurrentUser() user: any,
  ) {
    return this.contractsService.create(createContractDto, user.userId);
  }

  @ApiOperation({ summary: 'Get all contracts' })
  @ApiResponse({ status: 200, description: 'Return all contracts.' })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  async findAll(
    @Query('clientId') clientId?: string,
    @Query('status') status?: ContractStatus,
  ) {
    return this.contractsService.findAll({ clientId, status });
  }

  @ApiOperation({ summary: 'Get contract by ID' })
  @ApiResponse({ status: 200, description: 'Return contract by ID.' })
  @ApiResponse({ status: 404, description: 'Contract not found.' })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async findById(@Param('id') id: string) {
    return this.contractsService.findById(id);
  }

  @ApiOperation({ summary: 'Approve contract' })
  @ApiResponse({ status: 200, description: 'Contract approved successfully.' })
  @Patch(':id/approve')
  @Roles(Role.ADMIN, Role.MANAGER)
  async approve(@Param('id') id: string) {
    return this.contractsService.approve(id);
  }

  @ApiOperation({ summary: 'Sign contract' })
  @ApiResponse({ status: 200, description: 'Contract signed successfully.' })
  @Patch(':id/sign')
  @Roles(Role.ADMIN, Role.MANAGER)
  async sign(@Param('id') id: string, @Body('signedUrl') signedUrl: string) {
    return this.contractsService.sign(id, signedUrl);
  }
}
