import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ClientsService } from '../application/clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateClientUserDto } from './dto/create-client-user.dto';
import { IssueClientAccessLinkDto } from './dto/issue-client-access-link.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MANAGER')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'Return all clients.' })
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('all_clients')
  @CacheTTL(300000) // 5 minutes cache
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.clientsService.findAll({ page, limit, search, isActive });
  }

  @ApiOperation({ summary: 'Get client by ID' })
  @ApiResponse({ status: 200, description: 'Return client by ID.' })
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000) // 1 minute cache
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.findById(id);
  }

  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client successfully created.' })
  @Post()
  async create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({ status: 200, description: 'Client successfully updated.' })
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Create a client user' })
  @ApiResponse({ status: 201, description: 'Client user created.' })
  @Post(':id/users')
  async createClientUser(
    @Param('id', ParseUUIDPipe) clientId: string,
    @Body() dto: CreateClientUserDto,
  ) {
    return this.clientsService.createClientUser(
      clientId,
      dto.email,
      dto.password,
    );
  }

  @ApiOperation({ summary: 'Issue access link to client user' })
  @ApiResponse({ status: 200, description: 'Access link token issued.' })
  @Post('users/access-link')
  async issueAccessLink(@Body() dto: IssueClientAccessLinkDto) {
    return this.clientsService.issueAccessLink(dto);
  }
}
