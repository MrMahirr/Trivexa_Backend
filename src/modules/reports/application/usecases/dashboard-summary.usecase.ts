import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../../database/pool';

@Injectable()
export class DashboardSummaryUseCase {
  constructor(private readonly dbPool: DatabasePool) {}

  async execute() {
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
}
