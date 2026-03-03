import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  serviceId: process.env.EMAIL_SERVICE_ID,
  templateId: process.env.EMAIL_TEMPLATE_ID,
  userId: process.env.EMAIL_USER_ID,
  accessToken: process.env.EMAIL_ACCESS_TOKEN,
}));
