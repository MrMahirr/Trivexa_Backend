import { Test, TestingModule } from '@nestjs/testing';
import { SendEmailUseCase } from './send-email.usecase';
import { EMAIL_SERVICE, IEmailService } from '../../../../shared/email/interfaces/email-service.interface';

describe('SendEmailUseCase', () => {
    let useCase: SendEmailUseCase;
    let emailService: jest.Mocked<IEmailService>;

    beforeEach(async () => {
        emailService = {
            sendEmail: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SendEmailUseCase,
                { provide: EMAIL_SERVICE, useValue: emailService },
            ],
        }).compile();

        useCase = module.get<SendEmailUseCase>(SendEmailUseCase);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should send a plain text email', async () => {
            emailService.sendEmail.mockResolvedValue(undefined);

            await useCase.execute('user@example.com', 'Test Subject', 'Hello!', false);

            expect(emailService.sendEmail).toHaveBeenCalledWith({
                to: 'user@example.com',
                subject: 'Test Subject',
                text: 'Hello!',
                html: undefined,
            });
        });

        it('should send an HTML email', async () => {
            emailService.sendEmail.mockResolvedValue(undefined);

            await useCase.execute('user@example.com', 'Test Subject', '<h1>Hello!</h1>', true);

            expect(emailService.sendEmail).toHaveBeenCalledWith({
                to: 'user@example.com',
                subject: 'Test Subject',
                text: undefined,
                html: '<h1>Hello!</h1>',
            });
        });

        it('should default to plain text when isHtml not provided', async () => {
            emailService.sendEmail.mockResolvedValue(undefined);

            await useCase.execute('user@example.com', 'Subject', 'Content');

            expect(emailService.sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({ text: 'Content', html: undefined }),
            );
        });

        it('should not throw when email service fails', async () => {
            emailService.sendEmail.mockRejectedValue(new Error('SMTP error'));

            // Should not throw — error is caught and logged
            await expect(useCase.execute('user@example.com', 'Sub', 'Body'))
                .resolves.toBeUndefined();
        });
    });
});
