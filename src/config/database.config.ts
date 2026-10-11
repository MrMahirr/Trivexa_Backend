import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '2678', 10),
  name: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Connection Pool Settings
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    // Time (ms) client can be idle before being closed
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '10000', 10), // 10s
    // Maximum time (ms) to wait for a connection
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10), // 30s
    // Allow pool to shrink below min during idle periods
    allowExitOnIdle: false,
  },

  // Deprecated direct properties (kept for backward compatibility)
  maxConnections: parseInt(process.env.DB_POOL_MAX || '20', 10),
  minConnections: parseInt(process.env.DB_POOL_MIN || '2', 10),

  ssl: process.env.DB_SSL === 'true',

  // Query timeout (30 seconds)
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000', 10),

  // Statement timeout (prevent long-running queries)
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000', 10),
}));
