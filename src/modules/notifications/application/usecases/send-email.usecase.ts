import { Injectable, Inject, Logger } from '@nestjs/common';
import { EMAIL_SERVICE, IEmailService } from '../../../../shared/email/interfaces/email-service.interface';

@Injectable()
export class SendEmailUseCase {
    private readonly logger = new Logger(SendEmailUseCase.name);

    constructor(
        @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
    ) { }

    async execute(to: string, subject: string, content: string, isHtml: boolean = false): Promise<void> {
        try {
            await this.emailService.sendEmail({
                to,
                subject,
                text: isHtml ? undefined : content,
                html: isHtml ? content : undefined,
            });
            this.logger.log(`Email sent to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`);
            // We might want to rethrow or just log, depending on if it's critical
        }
    }
}
