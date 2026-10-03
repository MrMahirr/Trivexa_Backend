import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Pool } from 'pg';
import databaseConfig from '../config/database.config';
import { FeatureFlagService } from '../shared/feature-flag/feature-flag.service';

@Injectable()
export class DatabasePool implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabasePool.name);
  private pool: Pool;

  constructor(
    @Inject(databaseConfig.KEY)
    private readonly dbConfig: ConfigType<typeof databaseConfig>,
    private readonly featureFlagService: FeatureFlagService,
  ) {
    const isDemo = this.featureFlagService.isEnabled('DEMO_MODE');
    const targetDatabase = isDemo
      ? process.env.DB_DEMO_NAME || `${this.dbConfig.name}_demo`
      : this.dbConfig.name;

    this.pool = new Pool({
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      user: this.dbConfig.user,
      password: this.dbConfig.password,
      database: targetDatabase,
      max: this.dbConfig.maxConnections,
      min: this.dbConfig.minConnections,
      ssl: this.dbConfig.ssl ? { rejectUnauthorized: false } : undefined,
    });
  }

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      this.logger.log('Database connection established successfully');
      client.release();
    } catch (error) {
      this.logger.error('Failed to connect to the database', error.stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('Database connection pool closed');
  }

  getPool(): Pool {
    return this.pool;
  }
}
