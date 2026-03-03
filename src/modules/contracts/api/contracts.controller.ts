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
import { ListContractsQueryDto } from './dto/list-contracts.query';
import { UpdateContractStatusDto } from './dto/update-contract-status.dto';
import { ContractsService } from '../application/contracts.service';

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
  async findAll(@Query() query: ListContractsQueryDto) {
    return this.contractsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get contract by ID' })
  @ApiResponse({ status: 200, description: 'Return contract by ID.' })
  @ApiResponse({ status: 404, description: 'Contract not found.' })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async findById(@Param('id') id: string) {
    return this.contractsService.findById(id);
  }

  @ApiOperation({ summary: 'Update contract status' })
  @ApiResponse({
    status: 200,
    description: 'Contract status updated successfully.',
  })
  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANAGER)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContractStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.contractsService.updateStatus(id, dto, user.userId);
  }
}
