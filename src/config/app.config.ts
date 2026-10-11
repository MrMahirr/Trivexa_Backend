import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  name: process.env.APP_NAME || 'Trivexa Backend',
  port: parseInt(process.env.APP_PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || process.env.APP_PREFIX || 'api/v1',
  fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || 'en',
  headerLanguage: process.env.APP_HEADER_LANGUAGE || 'x-custom-lang',
  adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@trivexa.com',
  clientPortalBaseUrl:
    process.env.CLIENT_PORTAL_BASE_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://portal.trivexa.com'
      : 'http://localhost:3001'),
}));
