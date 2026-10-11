import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  IEmailOptions,
  IEmailService,
} from '../interfaces/email-service.interface';

@Injectable()
export class EmailJsProvider implements IEmailService {
  private readonly logger = new Logger(EmailJsProvider.name);
  private readonly apiUrl = 'https://api.emailjs.com/api/v1.0/email/send';

  constructor(private readonly configService: ConfigService) {}

  async sendEmail(options: IEmailOptions): Promise<void> {
    const serviceId = this.configService.get('email.serviceId');
    const templateId =
      options.templateId || this.configService.get('email.templateId');
    const userId = this.configService.get('email.userId'); // Public Key
    const accessToken = this.configService.get('email.accessToken'); // Private Key

    if (!serviceId || !userId || !accessToken) {
      this.logger.warn('EmailJS configuration missing. Email not sent.');
      return;
    }

    // Debug config values (masked)
    this.logger.log(`Service ID: ${serviceId}`);
    this.logger.log(`User ID: ${userId}`);
    this.logger.log(
      `Access Token: ${accessToken ? accessToken.substring(0, 5) + '...' : 'MISSING'}`,
    );

    const mergedVariables = {
      ...(options.variables || {}),
    };
    const resolvedRecipient = String(
      options.to ||
        mergedVariables.to_email ||
        mergedVariables.to ||
        mergedVariables.recipient ||
        mergedVariables.email ||
        mergedVariables.user_email ||
        mergedVariables.recipient_email ||
        '',
    ).trim();

    if (!resolvedRecipient) {
      this.logger.warn('Email recipient is empty. Email not sent.');
      return;
    }

    const templateParams = {
      ...mergedVariables,
      to_email: resolvedRecipient,
      to: resolvedRecipient,
      recipient: resolvedRecipient,
      email: resolvedRecipient,
      user_email: resolvedRecipient,
      recipient_email: resolvedRecipient,
      reply_to: resolvedRecipient,
      subject: options.subject,
      message: options.text || options.html,
    };

    const data = {
      service_id: serviceId,
      template_id: templateId,
      user_id: userId,
      accessToken: accessToken,
      template_params: templateParams,
    };

    try {
      await axios.post(this.apiUrl, data, {
        headers: {
          'Content-Type': 'application/json',
          Origin: 'http://localhost', // Workaround: Simulate browser origin
        },
      });
      this.logger.log(`Email sent to ${options.to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email: ${error.message} - ${JSON.stringify(error.response?.data)}`,
      );
      throw error;
    }
  }
}
