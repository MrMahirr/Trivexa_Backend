import { Injectable, Logger } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientsRepository } from '../infrastructure/clients.repository';
import { CreateClientDto } from '../api/dto/create-client.dto';
import { UpdateClientDto } from '../api/dto/update-client.dto';
import { IssueClientAccessLinkDto } from '../api/dto/issue-client-access-link.dto';
import { CreateClientUseCase } from './usecases/create-client.usecase';
import { UpdateClientUseCase } from './usecases/update-client.usecase';
import { CreateClientUserUseCase } from './usecases/create-client-user.usecase';
import { IssueClientAccessLinkUseCase } from './usecases/issue-client-access-link.usecase';
import { ProjectsRepository } from '../../projects/infrastructure/projects.repository';
import { MeetingsService } from '../../meetings/application/meetings.service';
import { ContractsService } from '../../contracts/application/contracts.service';
import { InvoicesService } from '../../finance/invoices/application/invoices.service';
import { PaymentsService } from '../../finance/payments/application/payments.service';
import { TicketsService } from '../../tickets/application/tickets.service';

export class ClientNotFoundException extends HttpException {
  constructor() {
    super('Client not found', HttpStatus.NOT_FOUND);
  }
}

export class ClientAlreadyExistsException extends HttpException {
  constructor(field: string) {
    super(`A client with this ${field} already exists`, HttpStatus.CONFLICT);
  }
}

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    private readonly clientsRepo: ClientsRepository,
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
    private readonly createClientUserUseCase: CreateClientUserUseCase,
    private readonly issueClientAccessLinkUseCase: IssueClientAccessLinkUseCase,
    private readonly projectsRepo: ProjectsRepository,
    private readonly meetingsService: MeetingsService,
    private readonly contractsService: ContractsService,
    private readonly invoicesService: InvoicesService,
    private readonly paymentsService: PaymentsService,
    private readonly ticketsService: TicketsService,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const normalizedIsActive = this.parseBooleanFilter(query.isActive);

    const { data, total } = await this.clientsRepo.findAll({
      page,
      limit,
      search: query.search,
      isActive: normalizedIsActive,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const client = await this.clientsRepo.findById(id);
    if (!client) throw new ClientNotFoundException();
    return client;
  }

  async create(dto: CreateClientDto) {
    const client = await this.createClientUseCase.execute(dto);
    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    const updated = await this.updateClientUseCase.execute(id, dto);
    return updated;
  }

  async activate(id: string) {
    const updated = await this.clientsRepo.setActiveStatus(id, true);
    if (!updated) throw new ClientNotFoundException();
    return updated;
  }

  async deactivate(id: string) {
    const updated = await this.clientsRepo.setActiveStatus(id, false);
    if (!updated) throw new ClientNotFoundException();
    return updated;
  }

  async remove(id: string) {
    return this.deactivate(id);
  }

  async createClientUser(
    clientId: string,
    email: string,
    rawPassword?: string,
  ) {
    return this.createClientUserUseCase.execute(clientId, email, rawPassword);
  }

  async issueAccessLink(dto: IssueClientAccessLinkDto) {
    return this.issueClientAccessLinkUseCase.execute(dto);
  }

  async getClientWorkspace(id: string, userId?: string, role?: string) {
    const client = await this.clientsRepo.findById(id);
    if (!client) throw new ClientNotFoundException();

    const [projectsResult, meetings, contracts, invoices, ticketsResult] =
      await Promise.all([
        this.safeCall(
          () =>
            this.projectsRepo.findAll(
              {
                page: 1,
                limit: 100,
                clientId: id,
              },
              userId,
              role,
            ),
          { data: [], total: 0 },
          'projectsRepo.findAll',
          id,
        ),
        this.safeCall(
          () => this.meetingsService.findAll({ clientId: id }),
          [],
          'meetingsService.findAll',
          id,
        ),
        this.safeCall(
          () => this.contractsService.findAll({ clientId: id }),
          [],
          'contractsService.findAll',
          id,
        ),
        this.safeCall(
          () => this.invoicesService.findAll({ clientId: id, page: 1, limit: 100 }),
          [],
          'invoicesService.findAll',
          id,
        ),
        this.safeCall(
          () =>
            this.ticketsService.findAll(
              { page: 1, limit: 500 },
              userId || '',
              role || '',
            ),
          { data: [], total: 0 },
          'ticketsService.findAll',
          id,
        ),
      ]);

    const paymentsByInvoice = await Promise.all(
      invoices.map(async (invoice) => {
        const payments = await this.safeCall(
          () => this.paymentsService.getPaymentsByInvoice(invoice.id),
          [],
          'paymentsService.getPaymentsByInvoice',
          id,
        );

        return {
          invoiceId: invoice.id,
          payments,
        };
      }),
    );

    const normalizedProjectNames = projectsResult.data
      .map((project) => (project.name || '').trim().toLowerCase())
      .filter(Boolean);
    const normalizedMeetingTitles = meetings
      .map((meeting) => (meeting.title || '').trim().toLowerCase())
      .filter(Boolean);
    const normalizedClientName = (client.companyName || '').trim().toLowerCase();

    const relatedTickets = ticketsResult.data.filter((ticket) => {
      const haystack = `${ticket.subject || ''} ${ticket.description || ''}`
        .toLowerCase()
        .trim();
      if (!haystack) return false;

      if (normalizedClientName && haystack.includes(normalizedClientName)) {
        return true;
      }

      if (
        normalizedProjectNames.some(
          (projectName) => projectName && haystack.includes(projectName),
        )
      ) {
        return true;
      }

      if (
        normalizedMeetingTitles.some(
          (meetingTitle) => meetingTitle && haystack.includes(meetingTitle),
        )
      ) {
        return true;
      }

      return false;
    });

    const paidByInvoice = new Map<string, number>();
    paymentsByInvoice.forEach(({ invoiceId, payments }) => {
      const total = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      paidByInvoice.set(invoiceId, total);
    });

    const totalInvoiced = invoices.reduce(
      (sum, invoice) => sum + (invoice.total || 0),
      0,
    );
    const totalCollected = paymentsByInvoice.reduce(
      (sum, row) =>
        sum + row.payments.reduce((rowSum, payment) => rowSum + (payment.amount || 0), 0),
      0,
    );
    const outstandingAmount = invoices.reduce((sum, invoice) => {
      const paid = paidByInvoice.get(invoice.id) || 0;
      const outstanding = (invoice.total || 0) - paid;
      return sum + (outstanding > 0 ? outstanding : 0);
    }, 0);

    const pendingInvoiceStatuses = new Set(['DRAFT', 'SENT', 'PARTIALLY_PAID', 'OVERDUE']);
    const pendingInvoices = invoices.filter((invoice) =>
      pendingInvoiceStatuses.has(String(invoice.status)),
    ).length;

    return {
      client,
      summary: {
        totalProjects: projectsResult.total ?? projectsResult.data.length,
        activeProjects: projectsResult.data.filter(
          (project) => String(project.status).toUpperCase() === 'IN_PROGRESS',
        ).length,
        totalFeedbacks: meetings.length,
        totalTickets: relatedTickets.length,
        totalContracts: contracts.length,
        pendingInvoices,
        totalInvoiced,
        totalCollected,
        outstandingAmount,
      },
      projects: projectsResult.data,
      feedbacks: meetings,
      tickets: relatedTickets,
      finance: {
        invoices,
        paymentsByInvoice,
        totalInvoiced,
        totalCollected,
        outstandingAmount,
      },
      contracts,
    };
  }

  private async safeCall<T>(
    fn: () => Promise<T>,
    fallback: T,
    source: string,
    clientId: string,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.logger.warn(
        `[workspace] partial failure in ${source} for client ${clientId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return fallback;
    }
  }

  private parseBooleanFilter(value?: string) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const normalized = String(value).trim().toLowerCase();
    if (['true', '1', 'active', 'aktif'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'inactive', 'pasif'].includes(normalized)) {
      return false;
    }

    return undefined;
  }
}
