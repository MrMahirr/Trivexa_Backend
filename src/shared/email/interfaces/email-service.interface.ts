
export interface IEmailOptions {
    to: string;
    subject: string;
    text?: string;       // Plain text
    html?: string;       // HTML content
    templateId?: string; // Optional: EmailJS Template ID
    variables?: Record<string, any>; // Optional: Template variables
}

export interface IEmailService {
    sendEmail(options: IEmailOptions): Promise<void>;
}

export const EMAIL_SERVICE = 'EMAIL_SERVICE';
