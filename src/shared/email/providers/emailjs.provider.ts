import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IEmailOptions, IEmailService } from '../interfaces/email-service.interface';

@Injectable()
export class EmailJsProvider implements IEmailService {
    private readonly logger = new Logger(EmailJsProvider.name);
    private readonly apiUrl = 'https://api.emailjs.com/api/v1.0/email/send';

    constructor(private readonly configService: ConfigService) { }

    async sendEmail(options: IEmailOptions): Promise<void> {
        const serviceId = this.configService.get('email.serviceId');
        const templateId = options.templateId || this.configService.get('email.templateId');
        const userId = this.configService.get('email.userId'); // Public Key
        const accessToken = this.configService.get('email.accessToken'); // Private Key

        if (!serviceId || !userId || !accessToken) {
            this.logger.warn('EmailJS configuration missing. Email not sent.');
            return;
        }

        const data = {
            service_id: serviceId,
            template_id: templateId,
            user_id: userId,
            accessToken: accessToken,
            template_params: {
                to_email: options.to,
                subject: options.subject,
                message: options.text || options.html,
                ...options.variables,
            },
        };

        try {
            await axios.post(this.apiUrl, data);
            this.logger.log(`Email sent to ${options.to}`);
        } catch (error) {
            this.logger.error(`Failed to send email: ${error.message} - ${error.response?.data}`);
            // Don't throw to avoid breaking the flow if email fails
        }
    }
}
