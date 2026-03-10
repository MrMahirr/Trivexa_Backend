import { registerAs } from '@nestjs/config';

function resolveCorsOrigins(): string[] {
  const rawOrigins = process.env.CORS_ORIGIN ?? process.env.CORS_ORIGINS ?? '';
  const parsedOrigins = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const defaultDevOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
  ];
  const isProduction = String(process.env.NODE_ENV ?? '').toLowerCase() === 'production';

  if (parsedOrigins.length === 0) {
    return defaultDevOrigins;
  }

  if (isProduction) {
    return parsedOrigins;
  }

  return [...new Set([...parsedOrigins, ...defaultDevOrigins])];
}

export default registerAs('security', () => ({
  cors: {
    enabled: true,
    origin: resolveCorsOrigins(),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
    crossOriginEmbedderPolicy: false,
  },
  bcryptSaltOrRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
}));
