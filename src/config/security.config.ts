import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
    cors: {
        enabled: true,
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        credentials: true,
    },
    helmet: {
        enabled: true,
    },
    bcryptSaltOrRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
}));
