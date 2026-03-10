import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { EMAIL_SERVICE, IEmailService } from '../../../shared/email/interfaces/email-service.interface';
import { CreateContactMessageDto } from '../api/dto/create-contact-message.dto';
import { ClientUsersRepository } from '../../clients/infrastructure/client-users.repository';
import { ClientsRepository } from '../../clients/infrastructure/clients.repository';
import { ListContactRequestsQueryDto } from '../api/dto/list-contact-requests.query';
import { LandingContactRequestsRepository } from '../infrastructure/landing-contact-requests.repository';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { LandingContentDto } from '../api/dto/landing-content.dto';

type LandingHeroContent = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  backgroundImage: string;
};

type LandingIntroContent = {
  label: string;
  title: string;
  paragraphs: string[];
  tickerTexts: string[];
};

type LandingServiceItem = { title: string; description: string };
type LandingServiceItemInput = { title?: string; description?: string };

type LandingServicesContent = {
  label: string;
  title: string;
  items: LandingServiceItem[];
};

type LandingProcessStep = { title: string; description: string };
type LandingProcessStepInput = { title?: string; description?: string };

type LandingProcessContent = {
  label: string;
  title: string;
  steps: LandingProcessStep[];
};

type LandingStat = { value: string; label: string };
type LandingStatInput = { value?: string; label?: string };

type LandingImpactContent = {
  label: string;
  title: string;
  ctaLabel: string;
  ctaLink: string;
  backgroundColor: string;
  stats: LandingStat[];
};

type LandingContactContent = {
  label: string;
  title: string;
  description: string;
  image: string;
};

type LandingServicesContentInput = {
  label?: string;
  title?: string;
  items?: LandingServiceItemInput[];
};

type LandingProcessContentInput = {
  label?: string;
  title?: string;
  steps?: LandingProcessStepInput[];
};

type LandingImpactContentInput = {
  label?: string;
  title?: string;
  ctaLabel?: string;
  ctaLink?: string;
  backgroundColor?: string;
  stats?: LandingStatInput[];
};

type LandingContent = {
  hero: LandingHeroContent;
  intro: LandingIntroContent;
  services: LandingServicesContent;
  process: LandingProcessContent;
  impact: LandingImpactContent;
  contact: LandingContactContent;
  meta?: {
    updatedAt?: string;
    updatedBy?: string | null;
  };
};

type LandingContentInput = {
  hero?: Partial<LandingHeroContent>;
  intro?: Partial<LandingIntroContent>;
  services?: LandingServicesContentInput;
  process?: LandingProcessContentInput;
  impact?: LandingImpactContentInput;
  contact?: Partial<LandingContactContent>;
  meta?: LandingContent['meta'];
};

const DEFAULT_LANDING_CONTENT: LandingContent = {
  hero: {
    title: 'Bir yonetimden daha fazlasi',
    subtitle: 'Harika fikirler, guclu yazilimlarla hayat bulur.',
    ctaLabel: 'Hemen Basla',
    ctaLink: '#agency-intro',
    backgroundImage: '/photo.png',
  },
  intro: {
    label: 'TRIVEXA',
    title: 'Yazilim ajansiniz: fikri urune, urunu buyumeye donusturuyoruz.',
    paragraphs: [
      'Trivexa; web ve mobil uygulama gelistirme, urun tasarimi, altyapi kurulumu ve teknik danismanlik alanlarinda uctan uca hizmet veren bir yazilim ajansidir. Ekibimiz, markanizin hedeflerine uygun, olceklenebilir ve performans odakli dijital urunler tasarlar.',
      'Sureci netlestiren, hizli teslimat yapan ve kaliteyi koruyan bir yaklasimla calisiriz. Ister sifirdan bir urun gelistirin, ister mevcut projenizi bir ust seviyeye tasiyin; Trivexa teknik gucunuz olur.',
    ],
    tickerTexts: ['Trivexa', 'Solve the Problem,'],
  },
  services: {
    label: 'Hizmetler',
    title: 'Uctan uca yazilim cozumleri',
    items: [
      {
        title: 'Web Uygulama Gelistirme',
        description:
          'Performans odakli, olceklenebilir ve surdurulebilir web urunleri gelistiriyoruz.',
      },
      {
        title: 'Mobil Uygulama Gelistirme',
        description:
          'iOS ve Android icin kullanici odakli, hizli ve guvenilir mobil deneyimler tasarliyoruz.',
      },
      {
        title: 'UI/UX Tasarim',
        description:
          'Markaniza uygun, sade ve etkili arayuzlerle kullanici deneyimini guclendiriyoruz.',
      },
      {
        title: 'Teknik Danismanlik',
        description:
          'Mimari kararlar, kod kalitesi ve urun yol haritasinda ekibinize stratejik destek veriyoruz.',
      },
    ],
  },
  process: {
    label: 'Surec',
    title: 'Nasil calisiyoruz?',
    steps: [
      {
        title: 'Kesif ve Planlama',
        description:
          'Ihtiyaclari netlestirir, hedefleri olculebilir adimlara donustururuz.',
      },
      {
        title: 'Tasarim ve Prototipleme',
        description:
          'Kullanici akislarini tasarlar, fikirleri hizli prototiplerle gorunur hale getiririz.',
      },
      {
        title: 'Gelistirme ve Test',
        description:
          'Temiz kod, duzenli test ve iteratif teslimatlarla guvenli bir surec yuruturuz.',
      },
      {
        title: 'Yayin ve Buyume',
        description:
          'Urunu yayina alir, metriklerle izler ve surekli iyilestirme uygulariz.',
      },
    ],
  },
  impact: {
    label: 'Trivexa Etkisi',
    title: 'Urununuzu daha hizli ve daha dogru buyutun',
    ctaLabel: 'Projeni Konusalim',
    ctaLink: '/iletisim',
    backgroundColor: '#7D98AA',
    stats: [
      { value: '50+', label: 'Tamamlanan Proje' },
      { value: '12', label: 'Farkli Sektor' },
      { value: '%98', label: 'Zamaninda Teslimat' },
      { value: '24/7', label: 'Teknik Destek' },
    ],
  },
  contact: {
    label: 'ILETISIM',
    title: 'Projenizi birlikte planlayalim.',
    description:
      'Kisa bir formla ihtiyacinizi aktarip ekibimizin size donus yapmasini saglayin.',
    image: '/contact.png',
  },
};

@Injectable()
export class LandingService {
  private readonly logger = new Logger(LandingService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly clientsRepository: ClientsRepository,
    private readonly clientUsersRepository: ClientUsersRepository,
    private readonly contactRequestsRepository: LandingContactRequestsRepository,
    private readonly usersRepository: UsersRepository,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
  ) {}

  async submitContactMessage(dto: CreateContactMessageDto) {
    const normalizedPayload = {
      fullName: dto.fullName.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone?.trim(),
      company: dto.company?.trim(),
      subject: dto.subject.trim(),
      message: dto.message.trim(),
    };
    const storedRequest = await this.contactRequestsRepository.create(normalizedPayload);

    return {
      accepted: true,
      delivered: false,
      reason: 'pending_approval',
      requestId: storedRequest.id,
    };
  }

  async listContactRequests(query: ListContactRequestsQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const status = query.status;
    const { data, total } = await this.contactRequestsRepository.findAll({
      page,
      limit,
      status,
      search: query.search?.trim() || undefined,
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

  async approveContactRequest(id: string, reviewerUserId: string) {
    const request = await this.contactRequestsRepository.findById(id);
    if (!request) {
      throw new HttpException('Contact request not found', HttpStatus.NOT_FOUND);
    }
    if (request.status !== 'PENDING') {
      throw new HttpException(
        'Only pending requests can be approved',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingClient = await this.clientsRepository.findByEmail(request.email);
    let linkedClientId = existingClient?.id;

    if (existingClient) {
      if (!existingClient.isActive) {
        await this.clientsRepository.setActiveStatus(existingClient.id, true);
      }
    } else {
      const baseCompanyName = request.company?.trim() || `${request.fullName} Talebi`;
      let companyName = baseCompanyName;
      const existingCompany = await this.clientsRepository.findByCompanyName(
        companyName,
      );
      if (existingCompany) {
        companyName = `${baseCompanyName} (${Date.now()})`;
      }

      const createdClient = await this.clientsRepository.create({
        companyName,
        contactPerson: request.fullName,
        email: request.email,
        phone: request.phone || undefined,
      });
      linkedClientId = createdClient.id;
      await this.clientsRepository.setActiveStatus(createdClient.id, true);
    }

    const approved = await this.contactRequestsRepository.markApproved(
      id,
      reviewerUserId,
      linkedClientId!,
    );

    if (!approved) {
      throw new HttpException(
        'Approval operation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const provisioned = await this.provisionClientPortalCredentials(
        linkedClientId!,
        request.email,
      );

      await this.sendClientApprovalEmail({
        toEmail: request.email,
        contactName: request.fullName,
        companyName: request.company || undefined,
        temporaryPassword: provisioned.temporaryPassword,
        magicLink: provisioned.magicLink,
        expiresAt: provisioned.expiresAt,
      });
    } catch (error) {
      this.logger.error(
        `Contact request approved but portal onboarding email failed for ${request.email}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return approved;
  }

  async rejectContactRequest(
    id: string,
    reviewerUserId: string,
    reason?: string,
  ) {
    const request = await this.contactRequestsRepository.findById(id);
    if (!request) {
      throw new HttpException('Contact request not found', HttpStatus.NOT_FOUND);
    }
    if (request.status !== 'PENDING') {
      throw new HttpException(
        'Only pending requests can be rejected',
        HttpStatus.BAD_REQUEST,
      );
    }

    const rejected = await this.contactRequestsRepository.markRejected(
      id,
      reviewerUserId,
      reason?.trim() || undefined,
    );
    if (!rejected) {
      throw new HttpException(
        'Reject operation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return rejected;
  }

  getCustomerPanelBootstrap() {
    return {
      routes: {
        login: '/api/v1/portal/login',
        dashboard: '/api/v1/portal/dashboard',
      },
      message: 'customer_panel_bootstrap_ready',
    };
  }

  async getTeamMembersByDepartment() {
    const departments = await this.usersRepository.findTeamMembersByDepartment();

    return {
      departments: departments.map((department) => ({
        department: department.department,
        members: department.members.map((member) => ({
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          fullName: `${member.firstName} ${member.lastName}`.trim(),
          role: member.role,
          avatarUrl: member.avatarUrl,
          isActive: member.isActive,
        })),
      })),
    };
  }

  async getLandingContent() {
    const stored = await this.readLandingContentFile();
    return this.mergeLandingContent(stored);
  }

  async updateLandingContent(dto: LandingContentDto, updatedBy?: string) {
    const merged = this.mergeLandingContent(dto);
    const payload: LandingContent = {
      ...merged,
      meta: {
        updatedAt: new Date().toISOString(),
        updatedBy: updatedBy || null,
      },
    };
    await this.writeLandingContentFile(payload);
    return payload;
  }

  private async provisionClientPortalCredentials(clientId: string, email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const temporaryPassword = this.generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    const existingClientUser = await this.clientUsersRepository.findByEmail(
      normalizedEmail,
    );

    let clientUserId = existingClientUser?.id;
    if (existingClientUser) {
      await this.clientUsersRepository.updatePasswordHash(
        existingClientUser.id,
        passwordHash,
        true,
      );
    } else {
      const createdClientUser = await this.clientUsersRepository.create({
        clientId,
        email: normalizedEmail,
        passwordHash,
        forcePasswordChange: true,
      });
      clientUserId = createdClientUser.id;
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    await this.clientUsersRepository.createAccessLink(clientUserId!, token, expiresAt);

    const portalBaseUrl = this.resolvePortalBaseUrl();
    const magicLink = `${portalBaseUrl}/portal/auth/verify?token=${token}&email=${encodeURIComponent(
      normalizedEmail,
    )}`;

    return {
      magicLink,
      temporaryPassword,
      expiresAt,
    };
  }

  private async sendClientApprovalEmail(payload: {
    toEmail: string;
    contactName: string;
    companyName?: string;
    temporaryPassword: string;
    magicLink: string;
    expiresAt: Date;
  }) {
    const senderEmail =
      this.configService.get<string>('app.adminEmail') || 'admin@trivexa.com';
    const templateId = this.configService.get<string>('email.clientApprovalTemplateId');

    await this.emailService.sendEmail({
      to: payload.toEmail,
      subject: 'Musteri portal erisiminiz olusturuldu',
      text: [
        `Merhaba ${payload.contactName},`,
        '',
        'Musteri kaydiniz onaylandi. Asagidaki bilgilerle portala giris yapabilirsiniz.',
        '',
        `Portal baglantisi: ${payload.magicLink}`,
        `E-posta: ${payload.toEmail}`,
        `Gecici sifre: ${payload.temporaryPassword}`,
        `Link gecerlilik suresi: ${payload.expiresAt.toISOString()}`,
        '',
        'Guvenlik nedeniyle ilk giriste sifrenizi degistirmeniz zorunludur.',
      ].join('\n'),
      templateId: templateId || undefined,
      variables: {
        from_name: 'Trivexa',
        from_email: senderEmail,
        to_name: payload.contactName,
        to_email: payload.toEmail,
        to: payload.toEmail,
        recipient: payload.toEmail,
        email: payload.toEmail,
        user_email: payload.toEmail,
        recipient_email: payload.toEmail,
        company_name: payload.companyName || '',
        portal_link: payload.magicLink,
        temporary_password: payload.temporaryPassword,
        expires_at: payload.expiresAt.toISOString(),
        subject: 'Musteri portal erisiminiz olusturuldu',
        message:
          'Musteri kaydiniz onaylandi. Bu e-postadaki baglanti ve gecici sifre ile portala giris yapabilirsiniz.',
      },
    });
  }

  private resolvePortalBaseUrl() {
    return (
      this.configService.get<string>('app.clientPortalBaseUrl') ||
      this.configService.get<string>('CLIENT_PORTAL_BASE_URL') ||
      'http://localhost:3001'
    ).replace(/\/+$/, '');
  }

  private generateTemporaryPassword(length = 12) {
    const alphabet =
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    const bytes = randomBytes(length);
    let password = '';
    for (let i = 0; i < length; i += 1) {
      password += alphabet[bytes[i] % alphabet.length];
    }
    return password;
  }

  private mergeLandingContent(raw?: LandingContentInput | null): LandingContent {
      const payload = raw && typeof raw === 'object' ? raw : {};
      const hero = { ...DEFAULT_LANDING_CONTENT.hero, ...(payload.hero ?? {}) };
      const introParagraphs = Array.isArray(payload.intro?.paragraphs) && payload.intro.paragraphs.length > 0
        ? payload.intro.paragraphs
        : DEFAULT_LANDING_CONTENT.intro.paragraphs;
      const introTickerTexts = Array.isArray(payload.intro?.tickerTexts) && payload.intro.tickerTexts.length > 0
        ? payload.intro.tickerTexts
        : DEFAULT_LANDING_CONTENT.intro.tickerTexts;
      const intro = {
        ...DEFAULT_LANDING_CONTENT.intro,
        ...(payload.intro ?? {}),
        paragraphs: introParagraphs,
        tickerTexts: introTickerTexts,
      };
      const servicesItems = Array.isArray(payload.services?.items) && payload.services.items.length > 0
        ? payload.services.items.map((item) => ({
          title: item.title ?? '',
          description: item.description ?? '',
        }))
        : DEFAULT_LANDING_CONTENT.services.items;
    const services = {
      ...DEFAULT_LANDING_CONTENT.services,
      ...(payload.services ?? {}),
      items: servicesItems,
    };
      const processSteps = Array.isArray(payload.process?.steps) && payload.process.steps.length > 0
        ? payload.process.steps.map((item) => ({
          title: item.title ?? '',
          description: item.description ?? '',
        }))
        : DEFAULT_LANDING_CONTENT.process.steps;
    const process = {
      ...DEFAULT_LANDING_CONTENT.process,
      ...(payload.process ?? {}),
      steps: processSteps,
    };
      const impactStats = Array.isArray(payload.impact?.stats) && payload.impact.stats.length > 0
        ? payload.impact.stats.map((item) => ({
          value: item.value ?? '',
          label: item.label ?? '',
        }))
        : DEFAULT_LANDING_CONTENT.impact.stats;
    const impact = {
      ...DEFAULT_LANDING_CONTENT.impact,
      ...(payload.impact ?? {}),
      stats: impactStats,
    };
    const contact = {
      ...DEFAULT_LANDING_CONTENT.contact,
      ...(payload.contact ?? {}),
    };

      return {
        hero,
        intro,
        services,
        process,
        impact,
        contact,
      meta: payload.meta ?? undefined,
    };
  }

  private resolveLandingContentPath() {
    return join(process.cwd(), 'storage', 'landing-content.json');
  }

  private async readLandingContentFile(): Promise<LandingContent | null> {
    const filePath = this.resolveLandingContentPath();
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as LandingContent;
      }
    } catch {
      return null;
    }
    return null;
  }

  private async writeLandingContentFile(payload: LandingContent) {
    const filePath = this.resolveLandingContentPath();
    const dir = join(process.cwd(), 'storage');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
  }
}
