import { NotFoundError } from '../../../shared/errors/not-found.error';
import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DomainError, DomainErrorType } from '../../../shared/errors/domain.error';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import {
  EMAIL_SERVICE,
  IEmailService,
} from '../../../shared/email/interfaces/email-service.interface';
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

type LandingPolicyContent = {
  label: string;
  title: string;
  content: string;
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
  privacyPolicy: LandingPolicyContent;
  userPolicy: LandingPolicyContent;
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
  privacyPolicy?: Partial<LandingPolicyContent>;
  userPolicy?: Partial<LandingPolicyContent>;
  meta?: LandingContent['meta'];
};

const DEFAULT_LANDING_CONTENT: LandingContent = {
  hero: {
    title: 'Bir yönetimden daha fazlası',
    subtitle: 'Harika fikirler, güçlü yazılımlarla hayat bulur.',
    ctaLabel: 'Hemen Başla',
    ctaLink: '#agency-intro',
    backgroundImage: '/photo.png',
  },
  intro: {
    label: 'TRIVEXA',
    title: 'Yazılım ajansınız: fikri ürüne, ürünü büyümeye dönüştürüyoruz.',
    paragraphs: [
      'Trivexa; web ve mobil uygulama geliştirme, ürün tasarımı, altyapı kurulumu ve teknik danışmanlık alanlarında uçtan uca hizmet veren bir yazılım ajansıdır. Ekibimiz, markanızın hedeflerine uygun, ölçeklenebilir ve performans odaklı dijital ürünler tasarlar.',
      'Süreci netleştiren, hızlı teslimat yapan ve kaliteyi koruyan bir yaklaşımla çalışırız. İster sıfırdan bir ürün geliştirin, ister mevcut projenizi bir üst seviyeye taşıyın; Trivexa teknik gücünüz olur.',
    ],
    tickerTexts: ['Trivexa', 'Solve the Problem,'],
  },
  services: {
    label: 'Hizmetler',
    title: 'Uçtan uca yazılım çözümleri',
    items: [
      {
        title: 'Web Uygulama Geliştirme',
        description:
          'Performans odaklı, ölçeklenebilir ve sürdürülebilir web ürünleri geliştiriyoruz.',
      },
      {
        title: 'Mobil Uygulama Geliştirme',
        description:
          'iOS ve Android için kullanıcı odaklı, hızlı ve güvenilir mobil deneyimler tasarlıyoruz.',
      },
      {
        title: 'UI/UX Tasarım',
        description:
          'Markanıza uygun, sade ve etkili arayüzlerle kullanıcı deneyimini güçlendiriyoruz.',
      },
      {
        title: 'Teknik Danışmanlık',
        description:
          'Mimari kararlar, kod kalitesi ve ürün yol haritasında ekibinize stratejik destek veriyoruz.',
      },
    ],
  },
  process: {
    label: 'Süreç',
    title: 'Nasıl çalışıyoruz?',
    steps: [
      {
        title: 'Keşif ve Planlama',
        description:
          'İhtiyaçları netleştirir, hedefleri ölçülebilir adımlara dönüştürürüz.',
      },
      {
        title: 'Tasarım ve Prototipleme',
        description:
          'Kullanıcı akışlarını tasarlar, fikirleri hızlı prototiplerle görünür hale getiririz.',
      },
      {
        title: 'Geliştirme ve Test',
        description:
          'Temiz kod, düzenli test ve iteratif teslimatlarla güvenli bir süreç yürütürüz.',
      },
      {
        title: 'Yayın ve Büyüme',
        description:
          'Ürünü yayına alır, metriklerle izler ve sürekli iyileştirme uygularız.',
      },
    ],
  },
  impact: {
    label: 'Trivexa Etkisi',
    title: 'Ürününüzü daha hızlı ve daha doğru büyütün',
    ctaLabel: 'Projeni Konuşalım',
    ctaLink: '/iletisim',
    backgroundColor: '#7D98AA',
    stats: [
      { value: '50+', label: 'Tamamlanan Proje' },
      { value: '12', label: 'Farklı Sektör' },
      { value: '%98', label: 'Zamanında Teslimat' },
      { value: '24/7', label: 'Teknik Destek' },
    ],
  },
  contact: {
    label: 'İLETİŞİM',
    title: 'Projenizi birlikte planlayalım.',
    description:
      'Kısa bir formla ihtiyacınızı aktarıp ekibimizin size dönüş yapmasını sağlayın.',
    image: '/contact.png',
  },
  privacyPolicy: {
    label: 'Gizlilik',
    title: 'Gizlilik Politikası',
    content: `TRIVEXA olarak, kullanıcılarımızın kişisel verilerinin korunmasına ve güvenliğine en yüksek önemi veriyoruz. Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde veya hizmetlerimizi kullandığınızda bilgilerinizin nasıl toplandığını, kullanıldığını ve paylaşıldığını açıklamaktadır.

1. Toplanan Bilgiler
İletişim formları veya müşteri paneli aracılığıyla adınız, e-posta adresiniz, telefon numaranız ve şirket bilgileriniz gibi kişisel verileri toplayabiliriz. Sistem performansını artırmak amacıyla çerezler (cookies) ve benzeri teknolojiler kullanılarak anonim kullanım istatistikleri elde edilebilir.

2. Bilgilerin Kullanımı
Topladığımız bilgiler; size daha iyi hizmet sunmak, taleplerinizi yanıtlamak, projelerinizi yönetmek, müşteri portalı erişimi sağlamak ve yasal yükümlülüklerimizi yerine getirmek amacıyla kullanılır.

3. Bilgilerin Paylaşımı
Kişisel verileriniz, izniniz olmadan üçüncü şahıslarla paylaşılmaz. Sadece yasal zorunluluklar doğrultusunda resmi makamlarla veya hizmet sağlayıcı iş ortaklarımızla gizlilik sözleşmeleri çerçevesinde paylaşılabilir.

4. Veri Güvenliği
TRIVEXA, kişisel verilerinizi yetkisiz erişim, kayıp veya kötüye kullanıma karşı korumak için geçerli güvenlik önlemleri almaktadır.

5. Haklarınız
Kişisel verilerinizle ilgili bilgi alma, düzeltme veya silme talebinde bulunma hakkına sahipsiniz. Bizimle iletişim sayfamızdan irtibata geçebilirsiniz.`,
  },
  userPolicy: {
    label: 'Kullanıcı',
    title: 'Kullanıcı Politikası (Kullanım Şartları)',
    content: `TRIVEXA platformlarına hoş geldiniz. Web sitemizi veya müşteri portalımızı kullanarak aşağıdaki kullanım şartlarını kabul etmiş olursunuz:

1. Hizmet Kapsamı ve Fikri Mülkiyet
TRIVEXA, yazılım çözümleri ve danışmanlık hizmetleri sunar. Platformda yer alan içerik, logo, tasarım ve yazılım kodları TRIVEXA'nın mülkiyetindedir. Sözleşme ile aksi belirtilmedikçe kopyalanamaz veya izinsiz kullanılamaz.

2. Kullanıcı Yükümlülükleri
Müşteri paneline erişim bilgilerinizin güvenliğinden tamamen siz sorumlusunuz. Platformumuzu kullanırken yasalara uygun hareket etmeli, sisteme zarar verecek her türlü işlemden kaçınmalısınız.

3. Sunulan Bilgilerin Doğruluğu
Proje talepleri ve formlar aracılığıyla bize ilettiğiniz tüm bilgilerin doğru olduğunu beyan edersiniz. TRIVEXA, yanıltıcı bilgi sunulması halinde hizmet vermeyi reddedebilir.

4. Güncellemeler ve Değişiklikler
TRIVEXA, işbu Kullanıcı Politikası şartlarını ve sağlanan hizmetin detaylarını, önceden haber vermeksizin dilediği zaman değiştirme hakkını saklı tutar.

5. Sorumluluk Reddi
Web sitemiz veya hizmetlerimiz kesintisiz veya tamamen hatasız olma garantisi vermez. TRIVEXA, teknik veya idari kesintilerden doğabilecek doğrudan veya dolaylı zararlardan sorumlu tutulamaz.`,
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
    const storedRequest =
      await this.contactRequestsRepository.create(normalizedPayload);

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
      throw new NotFoundError('Contact request not found');
    }
    if (request.status !== 'PENDING') {
      throw new DomainError('Only pending requests can be approved', DomainErrorType.BUSINESS_RULE);
    }

    const existingClient = await this.clientsRepository.findByEmail(
      request.email,
    );
    let linkedClientId = existingClient?.id;

    if (existingClient) {
      if (!existingClient.isActive) {
        await this.clientsRepository.setActiveStatus(existingClient.id, true);
      }
    } else {
      const baseCompanyName =
        request.company?.trim() || `${request.fullName} Talebi`;
      let companyName = baseCompanyName;
      const existingCompany =
        await this.clientsRepository.findByCompanyName(companyName);
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
      linkedClientId,
    );

    if (!approved) {
      throw new DomainError('Approval operation failed', DomainErrorType.INTERNAL_ERROR);
    }

    try {
      const provisioned = await this.provisionClientPortalCredentials(
        linkedClientId,
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
      throw new NotFoundError('Contact request not found');
    }
    if (request.status !== 'PENDING') {
      throw new DomainError('Only pending requests can be rejected', DomainErrorType.BUSINESS_RULE);
    }

    const rejected = await this.contactRequestsRepository.markRejected(
      id,
      reviewerUserId,
      reason?.trim() || undefined,
    );
    if (!rejected) {
      throw new DomainError('Reject operation failed', DomainErrorType.INTERNAL_ERROR);
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
    const departments =
      await this.usersRepository.findTeamMembersByDepartment();

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

  private async provisionClientPortalCredentials(
    clientId: string,
    email: string,
  ) {
    const normalizedEmail = email.trim().toLowerCase();
    const temporaryPassword = this.generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    const existingClientUser =
      await this.clientUsersRepository.findByEmail(normalizedEmail);

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
    await this.clientUsersRepository.createAccessLink(
      clientUserId,
      token,
      expiresAt,
    );

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
    const templateId = this.configService.get<string>(
      'email.clientApprovalTemplateId',
    );

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

  private mergeLandingContent(
    raw?: LandingContentInput | null,
  ): LandingContent {
    const payload = raw && typeof raw === 'object' ? raw : {};
    const hero = { ...DEFAULT_LANDING_CONTENT.hero, ...(payload.hero ?? {}) };
    const introParagraphs =
      Array.isArray(payload.intro?.paragraphs) &&
      payload.intro.paragraphs.length > 0
        ? payload.intro.paragraphs
        : DEFAULT_LANDING_CONTENT.intro.paragraphs;
    const introTickerTexts =
      Array.isArray(payload.intro?.tickerTexts) &&
      payload.intro.tickerTexts.length > 0
        ? payload.intro.tickerTexts
        : DEFAULT_LANDING_CONTENT.intro.tickerTexts;
    const intro = {
      ...DEFAULT_LANDING_CONTENT.intro,
      ...(payload.intro ?? {}),
      paragraphs: introParagraphs,
      tickerTexts: introTickerTexts,
    };
    const servicesItems =
      Array.isArray(payload.services?.items) &&
      payload.services.items.length > 0
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
    const processSteps =
      Array.isArray(payload.process?.steps) && payload.process.steps.length > 0
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
    const impactStats =
      Array.isArray(payload.impact?.stats) && payload.impact.stats.length > 0
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
    const privacyPolicy = {
      ...DEFAULT_LANDING_CONTENT.privacyPolicy,
      ...(payload.privacyPolicy ?? {}),
    };
    const userPolicy = {
      ...DEFAULT_LANDING_CONTENT.userPolicy,
      ...(payload.userPolicy ?? {}),
    };

    return {
      hero,
      intro,
      services,
      process,
      impact,
      contact,
      privacyPolicy,
      userPolicy,
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
