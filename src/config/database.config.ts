import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '2678', 10),
  name: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  maxConnections: parseInt(process.env.DB_POOL_MAX || '20', 10),
  minConnections: parseInt(process.env.DB_POOL_MIN || '2', 10),
  ssl: process.env.DB_SSL === 'true',
}));
