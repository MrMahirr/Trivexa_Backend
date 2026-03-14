import {
  BadRequestException,
  ForbiddenException,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Request,
  HttpCode,
  NotFoundException,
  Logger, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto } from '../../auth/api/dto/login.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../shared/enums/role.enum';
import { ClientsPublicService } from '../public/clients-public.service';
import { IssueClientAccessLinkDto } from './dto/issue-client-access-link.dto';
import { ForceChangeClientPasswordDto } from './dto/force-change-client-password.dto';
import { CreateClientPortalRequestDto } from './dto/create-client-portal-request.dto';
import { ClientPortalLoginUseCase } from '../application/usecases/client-portal-login.usecase';
import { ProjectsService } from '../../projects/application/projects.service';
import { ProjectsRepository } from '../../projects/infrastructure/projects.repository';
import { ContractsPublicService } from '../../contracts/public/contracts-public.service';
import { ContractStatus } from '../../contracts/domain/contract.entity';

@ApiTags('Client Portal')
@Controller('portal')
export class ClientPortalController {
  private readonly logger = new Logger(ClientPortalController.name);

  constructor(
    private readonly clientPortalLoginUseCase: ClientPortalLoginUseCase,
    private readonly clientsPublicService: ClientsPublicService,
    private readonly projectsService: ProjectsService,
    private readonly projectsRepository: ProjectsRepository,
    private readonly contractsPublicService: ContractsPublicService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Client login' })
  @ApiResponse({ status: 200, description: 'Return access token.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    return this.clientPortalLoginUseCase.execute(
      loginDto.email,
      loginDto.password,
    );
  }

  @Post('access-link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Issue an access link for a client (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return magic login link.' })
  async issueAccessLink(@Body() dto: IssueClientAccessLinkDto) {
    return this.clientsPublicService.issueAccessLink(dto);
  }

  @Post('force-change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Force change client password (Using token or first login)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return success message upon password change.',
  })
  async forceChangePassword(@Body() dto: ForceChangeClientPasswordDto) {
    // Note: In a real-world scenario, you might want to protect this with a token validation
    // guard if the user is not logged in, or check if the client UUID matches the logged-in user.
    return this.clientsPublicService.forceChangePassword(dto);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get client dashboard data' })
  @ApiResponse({ status: 200, description: 'Return dashboard statistics.' })
  async getDashboard(@Request() req) {
    if (req.user?.forcePasswordChange) {
      throw new ForbiddenException(
        'Ilk giriste sifrenizi degistirmeniz gerekiyor. Lutfen once sifre guncelleyin.',
      );
    }

    const clientId = req.user.clientId || req.user.userId;

    const [projects, approvedRequests] = await Promise.all([
      this.projectsService.findAll(
        { page: 1, limit: 10, clientId },
        undefined,
        Role.ADMIN,
      ),
      this.clientsPublicService.countApprovedPortalRequests(clientId),
    ]);

    return {
      message: 'Welcome to Client Portal',
      clientId: clientId || req.user.userId,
      activeProjects: projects.total,
      projects: projects.data,
      pendingInvoices: approvedRequests,
      unreadTickets: 0, // Placeholder for future module
    };
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List client portal requests' })
  @ApiResponse({ status: 200, description: 'Return client requests.' })
  async listRequests(@Request() req) {
    if (req.user?.forcePasswordChange) {
      throw new ForbiddenException(
        'Ilk giriste sifrenizi degistirmeniz gerekiyor. Lutfen once sifre guncelleyin.',
      );
    }

    const clientId = req.user.clientId || req.user.userId;
    return this.clientsPublicService.listClientPortalRequests(clientId);
  }

  @Get('contracts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List client portal contracts' })
  @ApiResponse({ status: 200, description: 'Return client contracts.' })
  async listContracts(@Request() req, @Query('status') status?: string) {
    if (req.user?.forcePasswordChange) {
      throw new ForbiddenException(
        'Ilk giriste sifrenizi degistirmeniz gerekiyor. Lutfen once sifre guncelleyin.',
      );
    }

    const clientId = req.user.clientId || req.user.userId;
    const normalizedStatus = (status || '').trim().toUpperCase();
    const allowedStatuses = Object.values(ContractStatus);

    if (
      normalizedStatus &&
      !allowedStatuses.includes(normalizedStatus as ContractStatus)
    ) {
      throw new BadRequestException('Gecersiz sozlesme durumu.');
    }

    return this.contractsPublicService.findByClientId(
      clientId,
      normalizedStatus ? (normalizedStatus as ContractStatus) : undefined,
    );
  }

  @Get('contracts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get client portal contract detail' })
  @ApiResponse({ status: 200, description: 'Return client contract detail.' })
  @ApiResponse({ status: 404, description: 'Contract not found.' })
  async getContractDetail(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (req.user?.forcePasswordChange) {
      throw new ForbiddenException(
        'Ilk giriste sifrenizi degistirmeniz gerekiyor. Lutfen once sifre guncelleyin.',
      );
    }

    const clientId = req.user.clientId || req.user.userId;
    const contract = await this.contractsPublicService.findById(id);
    if (!contract) {
      throw new NotFoundException('Sozlesme bulunamadi.');
    }
    if (contract.clientId !== clientId) {
      throw new ForbiddenException('Bu sozlesmeye erisim izniniz yok.');
    }

    return contract;
  }

  @Get('projects/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get client portal project detail' })
  @ApiResponse({
    status: 200,
    description: 'Return project detail for client.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  async getProjectDetail(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (req.user?.forcePasswordChange) {
      throw new ForbiddenException(
        'Ilk giriste sifrenizi degistirmeniz gerekiyor. Lutfen once sifre guncelleyin.',
      );
    }

    const clientId = req.user.clientId || req.user.userId;
    const project = await this.projectsRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Proje bulunamadi.');
    }
    if (!project.clientId || project.clientId !== clientId) {
      throw new ForbiddenException('Bu projeye erisim izniniz yok.');
    }

    let taskMetrics = { total: 0, completed: 0, percentage: 0 };
    let taskSnapshot = {
      summary: {
        total: 0,
        byStatus: {
          TODO: 0,
          IN_PROGRESS: 0,
          IN_REVIEW: 0,
          BLOCKED: 0,
          DONE: 0,
        },
        doneThisWeek: 0,
      },
      recentTasks: [],
    };

    try {
      const [metrics, snapshot] = await Promise.all([
        this.projectsRepository.getTaskMetrics(id),
        this.projectsRepository.getCodeProcessTaskSnapshot(id, 6),
      ]);
      taskMetrics = metrics;
      taskSnapshot = snapshot;
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Unknown error';
      this.logger.warn(`Project tasks snapshot failed for ${id}: ${message}`);
    }

    return {
      project,
      taskMetrics,
      taskSnapshot,
    };
  }

  @Post('requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create client portal request' })
  @ApiResponse({ status: 201, description: 'Request created.' })
  async createRequest(
    @Request() req,
    @Body() dto: CreateClientPortalRequestDto,
  ) {
    if (req.user?.forcePasswordChange) {
      throw new ForbiddenException(
        'Ilk giriste sifrenizi degistirmeniz gerekiyor. Lutfen once sifre guncelleyin.',
      );
    }

    const clientId = req.user.clientId || req.user.userId;
    return this.clientsPublicService.createClientPortalRequest(
      clientId,
      req.user.userId,
      dto,
    );
  }
}
