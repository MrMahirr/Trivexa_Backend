import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { EmailJsProvider } from '../src/shared/email/providers/emailjs.provider';
import mailConfig from '../src/config/mail.config';

async function run() {
  console.log('Sending Test Email...');

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [mailConfig],
      }),
    ],
    providers: [EmailJsProvider],
  }).compile();

  const emailProvider = moduleFixture.get<EmailJsProvider>(EmailJsProvider);

  // Replace with the user's email if possible, or a dummy one for now
  // Since we don't know the user's email, we'll ask them to check the logs or update this script
  const toEmail = 'test@example.com';

  try {
    await emailProvider.sendEmail({
      to: toEmail,
      subject: 'Trivexa Test Email',
      text: 'This is a test email from Trivexa Backend to verify EmailJS configuration.',
      html: '<p>This is a test email from <strong>Trivexa Backend</strong> to verify EmailJS configuration.</p>',
    });
    console.log(
      '✅ Test Email Sent! Check your EmailJS dashboard or the inbox of',
      toEmail,
    );
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
}

run();
