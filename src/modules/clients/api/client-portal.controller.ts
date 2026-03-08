import {
  ForbiddenException,
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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

@ApiTags('Client Portal')
@Controller('portal')
export class ClientPortalController {
  constructor(
    private readonly clientPortalLoginUseCase: ClientPortalLoginUseCase,
    private readonly clientsPublicService: ClientsPublicService,
    private readonly projectsService: ProjectsService,
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

    // RBAC: Fetch only projects associated with this client
    const projects = await this.projectsService.findAll(
      { page: 1, limit: 10, clientId },
      undefined,
      Role.ADMIN,
    );

    return {
      message: 'Welcome to Client Portal',
      clientId: clientId || req.user.userId,
      activeProjects: projects.total,
      projects: projects.data,
      pendingInvoices: 0, // Placeholder for future module
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
