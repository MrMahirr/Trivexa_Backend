import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMAIL_SERVICE, IEmailService } from '../../../shared/email/interfaces/email-service.interface';
import { CreateContactMessageDto } from '../api/dto/create-contact-message.dto';

@Injectable()
export class LandingService {
  private readonly logger = new Logger(LandingService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
  ) {}

  async submitContactMessage(dto: CreateContactMessageDto) {
    const receiver = this.configService.get<string>('email.contactReceiver');
    const templateId = this.configService.get<string>('email.contactTemplateId');

    const normalizedPayload = {
      fullName: dto.fullName.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone?.trim(),
      company: dto.company?.trim(),
      subject: dto.subject.trim(),
      message: dto.message.trim(),
    };

    if (!receiver) {
      this.logger.warn('CONTACT_FORM_RECEIVER not configured. Contact message stored in logs only.');
      this.logger.log(`Contact payload: ${JSON.stringify(normalizedPayload)}`);

      return {
        accepted: true,
        delivered: false,
        reason: 'receiver_not_configured',
      };
    }

    await this.emailService.sendEmail({
      to: receiver,
      subject: `[Landing Contact] ${normalizedPayload.subject}`,
      text: [
        `Name: ${normalizedPayload.fullName}`,
        `Email: ${normalizedPayload.email}`,
        `Phone: ${normalizedPayload.phone || '-'}`,
        `Company: ${normalizedPayload.company || '-'}`,
        '',
        normalizedPayload.message,
      ].join('\n'),
      templateId: templateId || undefined,
      variables: {
        from_name: normalizedPayload.fullName,
        from_email: normalizedPayload.email,
        phone: normalizedPayload.phone || '',
        company: normalizedPayload.company || '',
        subject: normalizedPayload.subject,
        message: normalizedPayload.message,
      },
    });

    return {
      accepted: true,
      delivered: true,
    };
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
}
