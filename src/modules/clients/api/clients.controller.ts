import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ClientsService } from '../application/clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateClientUserDto } from './dto/create-client-user.dto';
import { IssueClientAccessLinkDto } from './dto/issue-client-access-link.dto';
import { ListClientsQueryDto } from './dto/list-clients.query';
import { ListClientPortalRequestsQueryDto } from './dto/list-client-portal-requests.query';
import { UpdateClientPortalRequestStageDto } from './dto/update-client-portal-request-stage.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClientsListResponseDto, ClientSingleResponseDto } from './dto/response/clients-response.dto';
import { StandardResponseDto } from '../../../shared/dto/api-response.dto';

@ApiTags('Clients')
@ApiBearerAuth('access-token')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'Return all clients.', type: ClientsListResponseDto })
  @Get()
  @Roles('ADMIN', 'MANAGER', 'ACCOUNT_MANAGER', 'ACCOUNTING')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  async findAll(@Query() query: ListClientsQueryDto) {
    return this.clientsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get client portal support requests' })
  @ApiResponse({ status: 200, description: 'Return client portal support requests.' })
  @Get('portal-requests')
  @Roles('ADMIN', 'MANAGER', 'ACCOUNT_MANAGER', 'ACCOUNTING')
  async findPortalRequests(@Query() query: ListClientPortalRequestsQueryDto) {
    return this.clientsService.listPortalRequests(query);
  }

  @ApiOperation({ summary: 'Approve client portal support request' })
  @ApiResponse({ status: 200, description: 'Portal request approved.' })
  @Patch('portal-requests/:id/approve')
  @Roles('ADMIN', 'MANAGER', 'ACCOUNT_MANAGER')
  async approvePortalRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.clientsService.approvePortalRequest(
      id,
      user?.userId ?? user?.id ?? user?.sub ?? null,
    );
  }

  @ApiOperation({ summary: 'Update stage of an approved client portal request' })
  @ApiResponse({ status: 200, description: 'Portal request stage updated.' })
  @Patch('portal-requests/:id/stage')
  @Roles('ADMIN', 'MANAGER', 'ACCOUNT_MANAGER')
  async updatePortalRequestStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientPortalRequestStageDto,
  ) {
    return this.clientsService.updatePortalRequestStage(id, dto.stage);
  }

  @ApiOperation({ summary: 'Mark client portal request as completed' })
  @ApiResponse({ status: 200, description: 'Portal request completed.' })
  @Patch('portal-requests/:id/complete')
  @Roles('ADMIN', 'MANAGER', 'ACCOUNT_MANAGER')
  async completePortalRequest(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.completePortalRequest(id);
  }

  @ApiOperation({ summary: 'Get client by ID' })
  @ApiResponse({ status: 200, description: 'Return client by ID.', type: ClientSingleResponseDto })
  @Get(':id/workspace')
  @Roles('ADMIN', 'MANAGER', 'ACCOUNT_MANAGER', 'ACCOUNTING')
  async getClientWorkspace(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.clientsService.getClientWorkspace(id, user?.userId, user?.role);
  }

  @ApiOperation({ summary: 'Get client by ID' })
  @ApiResponse({ status: 200, description: 'Return client by ID.', type: ClientSingleResponseDto })
  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'ACCOUNT_MANAGER', 'ACCOUNTING')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.findById(id);
  }

  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client successfully created.', type: ClientSingleResponseDto })
  @Post()
  @Roles('ADMIN', 'MANAGER', 'ACCOUNT_MANAGER')
  async create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({ status: 200, description: 'Client successfully updated.', type: ClientSingleResponseDto })
  @Put(':id')
  @Roles('ADMIN', 'MANAGER', 'ACCOUNT_MANAGER')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Deactivate a client (soft delete)' })
  @ApiResponse({ status: 200, description: 'Client successfully deactivated.', type: ClientSingleResponseDto })
  @Patch(':id/deactivate')
  @Roles('ADMIN', 'MANAGER')
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.deactivate(id);
  }

  @ApiOperation({ summary: 'Activate a client' })
  @ApiResponse({ status: 200, description: 'Client successfully activated.', type: ClientSingleResponseDto })
  @Patch(':id/activate')
  @Roles('ADMIN', 'MANAGER')
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.activate(id);
  }

  @ApiOperation({ summary: 'Delete a client (soft delete)' })
  @ApiResponse({ status: 200, description: 'Client successfully deleted.', type: ClientSingleResponseDto })
  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.remove(id);
  }

  @ApiOperation({ summary: 'Create a client user' })
  @ApiResponse({ status: 201, description: 'Client user created.', type: StandardResponseDto })
  @Post(':id/users')
  @Roles('ADMIN', 'MANAGER', 'ACCOUNT_MANAGER')
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
  @ApiResponse({ status: 200, description: 'Access link token issued.', type: StandardResponseDto })
  @Post('users/access-link')
  @Roles('ADMIN', 'MANAGER', 'ACCOUNT_MANAGER')
  async issueAccessLink(@Body() dto: IssueClientAccessLinkDto) {
    return this.clientsService.issueAccessLink(dto);
  }

  @ApiOperation({ summary: 'Reset client portal password and resend access email' })
  @ApiResponse({ status: 200, description: 'Portal credentials reset.', type: StandardResponseDto })
  @Post(':id/portal/reset-access')
  @Roles('ADMIN', 'MANAGER', 'ACCOUNT_MANAGER')
  async resetPortalAccess(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.resetClientPortalAccess(id);
  }
}
