import {
  Injectable,
  Logger,
  Inject,
} from '@nestjs/common';
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
import {
  ClientPortalRequestEntity,
  ClientPortalRequestsRepository,
} from '../infrastructure/client-portal-requests.repository';
import { ClientUsersRepository } from '../infrastructure/client-users.repository';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  EMAIL_SERVICE,
  IEmailService,
} from '../../../shared/email/interfaces/email-service.interface';
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { DomainError, DomainErrorType } from "../../../shared/errors/domain.error";

export class ClientNotFoundException extends NotFoundError {
  constructor() {
    super('Client not found');
  }
}

export class ClientAlreadyExistsException extends DomainError {
  constructor(field: string) {
    super(`A client with this ${field} already exists`);
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
    private readonly clientPortalRequestsRepository: ClientPortalRequestsRepository,
    private readonly clientUsersRepo: ClientUsersRepository,
    private readonly configService: ConfigService,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
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

  async listPortalRequests(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    approvalStatus?: string;
    priority?: string;
    type?: string;
    stage?: string;
    clientId?: string;
    projectId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const { data, total } =
      await this.clientPortalRequestsRepository.findAllForAdmin({
        page,
        limit,
        search: query.search?.trim() || undefined,
        status: query.status,
        approvalStatus: query.approvalStatus,
        priority: query.priority,
        type: query.type,
        stage: query.stage,
        clientId: query.clientId,
        projectId: query.projectId,
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

  async approvePortalRequest(
    requestId: string,
    approvedByUserId: string | null,
  ) {
    const existing =
      await this.clientPortalRequestsRepository.findById(requestId);
    if (!existing) {
      throw new NotFoundError('Portal request not found');
    }

    const updated = await this.clientPortalRequestsRepository.approveByAdmin(
      requestId,
      approvedByUserId,
    );
    if (!updated) {
      throw new NotFoundError('Portal request not found');
    }

    await this.tryCreateMeetingFromApprovedPortalRequest(
      updated,
      approvedByUserId,
    );

    return updated;
  }

  async updatePortalRequestStage(requestId: string, stage: string) {
    const existing =
      await this.clientPortalRequestsRepository.findById(requestId);
    if (!existing) {
      throw new NotFoundError('Portal request not found');
    }

    if (String(existing.approval_status).toUpperCase() !== 'APPROVED') {
      throw new DomainError('Talep onaylanmadan asama secilemez.', DomainErrorType.BUSINESS_RULE);
    }

    const updated =
      await this.clientPortalRequestsRepository.updateStageByAdmin(
        requestId,
        stage,
      );
    if (!updated) {
      throw new DomainError('Portal request stage could not be updated', DomainErrorType.BUSINESS_RULE);
    }

    return updated;
  }

  async completePortalRequest(requestId: string) {
    const existing =
      await this.clientPortalRequestsRepository.findById(requestId);
    if (!existing) {
      throw new NotFoundError('Portal request not found');
    }

    if (String(existing.approval_status).toUpperCase() !== 'APPROVED') {
      throw new DomainError('Talep onaylanmadan tamamlandi olarak isaretlenemez.', DomainErrorType.BUSINESS_RULE);
    }

    const updated =
      await this.clientPortalRequestsRepository.markCompletedByAdmin(requestId);
    if (!updated) {
      throw new DomainError('Portal request could not be completed', DomainErrorType.BUSINESS_RULE);
    }

    return updated;
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

  async getPortalRequestById(requestId: string) {
    const row =
      await this.clientPortalRequestsRepository.findDetailById(requestId);
    if (!row) {
      throw new NotFoundError('Portal request not found');
    }
    return row;
  }

  async resetClientPortalAccess(clientId: string) {
    const client = await this.clientsRepo.findById(clientId);
    if (!client) throw new ClientNotFoundException();

    const email = (client.email || '').trim();
    if (!email) {
      throw new DomainError('Musteri e-posta adresi bulunamadi.', DomainErrorType.BUSINESS_RULE);
    }

    const rawPassword = randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    let clientUser = await this.clientUsersRepo.findByEmail(email);
    if (clientUser) {
      await this.clientUsersRepo.updatePasswordHash(
        clientUser.id,
        passwordHash,
        true,
      );
    } else {
      clientUser = await this.clientUsersRepo.create({
        clientId: client.id,
        email,
        passwordHash,
        forcePasswordChange: true,
      });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    await this.clientUsersRepo.createAccessLink(
      clientUser.id,
      token,
      expiresAt,
    );

    const portalBaseUrl = (
      this.configService.get<string>('app.clientPortalBaseUrl') ||
      this.configService.get<string>('CLIENT_PORTAL_BASE_URL') ||
      'http://localhost:3001'
    ).replace(/\/+$/, '');
    const magicLink = `${portalBaseUrl}/portal/auth/verify?token=${token}`;

    const subject = 'Portal erisim bilgileriniz yenilendi';
    const content = [
      `Merhaba ${client.contactPerson || client.companyName || 'Musteri'},`,
      '',
      'Portal erisim bilgileriniz guncellendi.',
      `E-posta: ${email}`,
      `Yeni sifre: ${rawPassword}`,
      `Giris linki: ${magicLink}`,
      `Link gecerlilik: ${expiresAt.toISOString()}`,
      '',
      'Guvenlik icin ilk giriste sifrenizi degistirmeniz gerekmektedir.',
    ].join('\n');

    await this.emailService.sendEmail({
      to: email,
      subject,
      text: content,
    });

    return {
      success: true,
      message: 'Portal sifresi sifirlandi ve e-posta yeniden gonderildi.',
      expiresAt,
      magicLink,
    };
  }

  async getClientWorkspace(id: string, userId?: string, role?: string) {
    const client = await this.clientsRepo.findById(id);
    if (!client) throw new ClientNotFoundException();

    const [
      projectsResult,
      meetings,
      contracts,
      invoices,
      ticketsResult,
      portalRequestsResult,
    ] = await Promise.all([
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
        () =>
          this.invoicesService.findAll({ clientId: id, page: 1, limit: 100 }),
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
      this.safeCall(
        () =>
          this.clientPortalRequestsRepository.findAllForAdmin({
            page: 1,
            limit: 200,
            clientId: id,
          }),
        { data: [], total: 0 },
        'clientPortalRequestsRepository.findAllForAdmin',
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
    const normalizedClientName = (client.companyName || '')
      .trim()
      .toLowerCase();

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

    const portalRequests = portalRequestsResult?.data ?? [];
    const requestTickets = portalRequests.map((request) => ({
      id: request.id,
      subject: request.subject,
      description: request.description,
      type: request.type,
      status: request.approval_status || request.status,
      priority: request.priority,
      createdAt:
        request.created_at instanceof Date
          ? request.created_at.toISOString()
          : request.created_at,
    }));
    const effectiveTickets =
      requestTickets.length > 0 ? requestTickets : relatedTickets;

    const paidByInvoice = new Map<string, number>();
    paymentsByInvoice.forEach(({ invoiceId, payments }) => {
      const total = payments.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0,
      );
      paidByInvoice.set(invoiceId, total);
    });

    const totalInvoiced = invoices.reduce(
      (sum, invoice) => sum + (invoice.total || 0),
      0,
    );
    const totalCollected = paymentsByInvoice.reduce(
      (sum, row) =>
        sum +
        row.payments.reduce(
          (rowSum, payment) => rowSum + (payment.amount || 0),
          0,
        ),
      0,
    );
    const outstandingAmount = invoices.reduce((sum, invoice) => {
      const paid = paidByInvoice.get(invoice.id) || 0;
      const outstanding = (invoice.total || 0) - paid;
      return sum + (outstanding > 0 ? outstanding : 0);
    }, 0);

    const pendingInvoiceStatuses = new Set([
      'DRAFT',
      'SENT',
      'PARTIALLY_PAID',
      'OVERDUE',
    ]);
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
        totalTickets: effectiveTickets.length,
        totalContracts: contracts.length,
        pendingInvoices,
        totalInvoiced,
        totalCollected,
        outstandingAmount,
      },
      projects: projectsResult.data,
      feedbacks: meetings,
      tickets: effectiveTickets,
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

  async getClientContracts(id: string) {
    const client = await this.clientsRepo.findById(id);
    if (!client) throw new ClientNotFoundException();
    return this.contractsService.findAll({ clientId: id });
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

  private async tryCreateMeetingFromApprovedPortalRequest(
    request: ClientPortalRequestEntity,
    approvedByUserId: string | null,
  ): Promise<void> {
    if (!this.isMeetingPortalRequest(request)) {
      return;
    }

    const organizerId = approvedByUserId || request.approved_by || null;
    if (!organizerId) {
      this.logger.warn(
        `[portal-request->meeting] skipped for ${request.id}: approver user id missing`,
      );
      return;
    }

    const requestedDate = this.extractRequestedMeetingDate(request.description);
    const now = new Date();
    const fallbackDate = new Date(now.getTime() + 30 * 60 * 1000);
    const meetingDate = requestedDate
      ? requestedDate.getTime() > now.getTime()
        ? requestedDate
        : fallbackDate
      : fallbackDate;

    const durationMinutes = this.extractRequestedDurationMinutes(
      request.description,
    );
    const notes = this.extractRequestedMeetingNotes(request.description);
    const title = this.extractMeetingTitle(request.subject);
    const requestMarker = this.buildPortalRequestMeetingMarker(request.id);

    const existingMeetings = await this.meetingsService.findAll({
      clientId: request.client_id,
      projectId: request.project_id || undefined,
    });
    const alreadyExists = existingMeetings.some((meeting) =>
      String(meeting.notes || '').includes(requestMarker),
    );
    if (alreadyExists) {
      this.logger.log(
        `[portal-request->meeting] skipped for ${request.id}: already linked meeting exists`,
      );
      return;
    }

    const fullNotes =
      `${request.description?.trim() || notes}\n${requestMarker}`.trim();

    try {
      await this.meetingsService.create(
        {
          title,
          date: meetingDate.toISOString(),
          durationMinutes,
          clientId: request.client_id,
          projectId: request.project_id || undefined,
          notes: fullNotes,
        },
        organizerId,
      );
      this.logger.log(
        `[portal-request->meeting] created for ${request.id}: ${title} (${meetingDate.toISOString()})`,
      );
    } catch (error) {
      this.logger.warn(
        `[portal-request->meeting] failed for ${request.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private isMeetingPortalRequest(request: ClientPortalRequestEntity): boolean {
    const subject = String(request.subject || '');
    const normalizedSubject = this.normalizeMeetingSubjectForMatch(subject);
    if (normalizedSubject.startsWith('gorusme talebi')) {
      return true;
    }

    const normalizedType = String(request.type || '').toUpperCase();
    if (normalizedType !== 'OTHER') {
      return false;
    }

    return normalizedSubject.includes('gorusme');
  }

  private extractMeetingTitle(subject?: string): string {
    const raw = String(subject || '');
    const cleaned = raw
      .replace(
        /^\s*g(?:o|\u00f6)r(?:u|\u00fc)(?:s|\u015f)me\s+taleb(?:i|\u0131)\s*-\s*/i,
        '',
      )
      .trim();

    return cleaned || 'Musteri Gorusmesi';
  }

  private extractRequestedMeetingDate(description?: string): Date | null {
    const text = String(description || '');
    const dateMatch = text.match(/tercih edilen tarih-saat:\s*([^\r\n]+)/i);
    if (dateMatch) {
      const parsed = new Date(dateMatch[1].trim());
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    const isoDateMatch = text.match(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    if (!isoDateMatch) {
      return null;
    }

    const parsed = new Date(isoDateMatch[0]);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private extractRequestedDurationMinutes(description?: string): number {
    const text = String(description || '');
    const durationMatch = text.match(/tahmini sure:\s*(\d+)/i);
    const parsed = Number.parseInt(durationMatch?.[1] || '30', 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 30;
    }

    return Math.min(Math.max(parsed, 15), 240);
  }

  private extractRequestedMeetingNotes(description?: string): string {
    const text = String(description || '').trim();
    if (!text) return '';

    const detailsMatch = text.match(/aciklama:\s*([\s\S]*)$/i);
    if (!detailsMatch) {
      return text;
    }

    return detailsMatch[1].trim();
  }

  private normalizeMeetingSubjectForMatch(value?: string): string {
    return String(value || '')
      .toLowerCase()
      .replace(/\u011f/g, 'g')
      .replace(/\u00fc/g, 'u')
      .replace(/\u015f/g, 's')
      .replace(/\u0131/g, 'i')
      .replace(/\u00f6/g, 'o')
      .replace(/\u00e7/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private buildPortalRequestMeetingMarker(requestId: string): string {
    return `[portal_request_id:${requestId}]`;
  }
}
