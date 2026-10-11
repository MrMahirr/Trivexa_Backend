import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import emailjs from '@emailjs/nodejs';

interface ClientUserCreatedEvent {
  clientId: string;
  email: string;
  password: string;
  forcePasswordChange?: boolean;
}

/**
 * Client User Created Event Listener
 *
 * Sends welcome email with credentials when a new client user is created
 */
@Injectable()
export class ClientUserCreatedListener {
  private readonly logger = new Logger(ClientUserCreatedListener.name);

  constructor(private readonly configService: ConfigService) {}

  @OnEvent('clientUser.created', { async: true })
  async handleClientUserCreated(event: ClientUserCreatedEvent) {
    try {
      await this.sendWelcomeEmail(event);
      this.logger.log(`Welcome email sent to ${event.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${event.email}`,
        error.stack,
      );
      // Don't throw - email failure shouldn't block user creation
    }
  }

  private async sendWelcomeEmail(event: ClientUserCreatedEvent) {
    const serviceId = this.configService.get<string>('EMAIL_SERVICE_ID');
    const templateId = this.configService.get<string>(
      'EMAIL_CLIENT_APPROVAL_TEMPLATE_ID',
    );
    const userId = this.configService.get<string>('EMAIL_USER_ID');
    const accessToken = this.configService.get<string>('EMAIL_ACCESS_TOKEN');

    if (!serviceId || !templateId || !userId || !accessToken) {
      this.logger.warn(
        'Email service not configured, skipping welcome email',
      );
      return;
    }

    const portalUrl =
      this.configService.get<string>('CLIENT_PORTAL_BASE_URL') ||
      'https://portal.trivexa.com';

    const loginUrl = `${portalUrl}/login`;
    const resetPasswordUrl = `${portalUrl}/reset-password?email=${encodeURIComponent(event.email)}`;

    const templateParams = {
      to_email: event.email,
      to_name: event.email.split('@')[0], // Use email prefix as name
      login_url: loginUrl,
      email: event.email,
      temporary_password: event.password,
      reset_password_url: resetPasswordUrl,
      portal_url: portalUrl,
      support_email: this.configService.get<string>(
        'ADMIN_NOTIFICATION_EMAIL',
      ) || 'support@trivexa.com',
    };

    try {
      await emailjs.send(serviceId, templateId, templateParams, {
        publicKey: userId,
        privateKey: accessToken,
      });

      this.logger.debug(
        `Email sent successfully to ${event.email} via EmailJS`,
      );
    } catch (error) {
      this.logger.error(
        `EmailJS send failed for ${event.email}: ${error.message}`,
      );
      throw error;
    }
  }
}
