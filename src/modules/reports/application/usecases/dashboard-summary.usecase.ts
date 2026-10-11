import { Injectable, Logger } from '@nestjs/common';
import { DatabasePool } from '../../../../database/pool';
import { CacheService } from '../../../../infrastructure/cache/cache.service';

@Injectable()
export class DashboardSummaryUseCase {
  private readonly logger = new Logger(DashboardSummaryUseCase.name);
  private readonly CACHE_KEY = 'reports:dashboard:summary';
  private readonly CACHE_TTL = 1800; // 30 minutes

  constructor(
    private readonly dbPool: DatabasePool,
    private readonly cacheService: CacheService,
  ) {}

  async execute() {
    return this.cacheService.getOrSet(
      this.CACHE_KEY,
      async () => this.fetchDashboardData(),
      this.CACHE_TTL,
    );
  }

  private async fetchDashboardData() {
    const pool = this.dbPool.getPool();

    const [
      usersResult,
      clientsResult,
      projectsResult,
      tasksResult,
      invoicesResult,
      ticketsResult,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as count FROM clients'),
      pool.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'ACTIVE') as active,
          COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed
        FROM projects`,
      ),
      pool.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'DONE') as completed,
          COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress
        FROM tasks`,
      ),
      pool.query(
        `SELECT 
          COUNT(*) as total,
          COALESCE(SUM(total), 0) as total_amount,
          COALESCE(SUM(total) FILTER (WHERE status = 'PAID'), 0) as collected,
          COALESCE(SUM(total) FILTER (WHERE status IN ('SENT', 'OVERDUE')), 0) as pending
        FROM invoices`,
      ),
      pool.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'OPEN') as open,
          COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved
        FROM tickets`,
      ),
    ]);

    return {
      users: {
        active: parseInt(usersResult.rows[0].count, 10),
      },
      clients: {
        total: parseInt(clientsResult.rows[0].count, 10),
      },
      projects: {
        total: parseInt(projectsResult.rows[0].total, 10),
        active: parseInt(projectsResult.rows[0].active, 10),
        completed: parseInt(projectsResult.rows[0].completed, 10),
      },
      tasks: {
        total: parseInt(tasksResult.rows[0].total, 10),
        completed: parseInt(tasksResult.rows[0].completed, 10),
        inProgress: parseInt(tasksResult.rows[0].in_progress, 10),
      },
      finance: {
        totalInvoices: parseInt(invoicesResult.rows[0].total, 10),
        totalAmount: parseFloat(invoicesResult.rows[0].total_amount),
        collected: parseFloat(invoicesResult.rows[0].collected),
        pending: parseFloat(invoicesResult.rows[0].pending),
      },
      tickets: {
        total: parseInt(ticketsResult.rows[0].total, 10),
        open: parseInt(ticketsResult.rows[0].open, 10),
        resolved: parseInt(ticketsResult.rows[0].resolved, 10),
      },
    };
  }

  /**
   * Invalidate dashboard cache
   * Call this after major data changes (new projects, invoices, etc.)
   */
  async invalidateCache(): Promise<void> {
    await this.cacheService.del(this.CACHE_KEY);
    this.logger.debug('Dashboard cache invalidated');
  }
}
