import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Performance Indexes Migration
 *
 * Adds indexes to improve query performance on frequently accessed tables
 * Based on common query patterns and joins
 */
export class PerformanceIndexes1771500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
      CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
    `);

    // Projects table indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
      CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date DESC);
      CREATE INDEX IF NOT EXISTS idx_projects_end_date ON projects(end_date DESC);
      CREATE INDEX IF NOT EXISTS idx_projects_client_status ON projects(client_id, status);
    `);

    // Tasks table indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
      CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status);
      CREATE INDEX IF NOT EXISTS idx_tasks_assignee_status ON tasks(assignee_id, status);
    `);

    // Time entries table indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
      CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
      CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time DESC);
      CREATE INDEX IF NOT EXISTS idx_time_entries_end_time ON time_entries(end_time DESC);
      CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, start_time DESC);
      CREATE INDEX IF NOT EXISTS idx_time_entries_project_date ON time_entries(project_id, start_time DESC);
    `);

    // Invoices table indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
      CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
      CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date DESC);
      CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
      CREATE INDEX IF NOT EXISTS idx_invoices_client_status ON invoices(client_id, status);
    `);

    // Audit logs table indexes (for reporting and compliance)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_user ON audit_logs(entity_type, entity_id, user_id);
    `);

    // Clients table indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
      CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
      CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
      CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
    `);

    // Notifications table indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
    `);

    // Comments table indexes (if exists)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id) WHERE task_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_comments_project_id ON comments(project_id) WHERE project_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
      CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
    `);

    // Refresh tokens table indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked ON refresh_tokens(is_revoked);
    `);

    console.log('Performance indexes created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all created indexes
    const indexes = [
      // Users
      'idx_users_email',
      'idx_users_role',
      'idx_users_department',
      'idx_users_active',
      'idx_users_created_at',
      // Projects
      'idx_projects_client_id',
      'idx_projects_status',
      'idx_projects_start_date',
      'idx_projects_end_date',
      'idx_projects_client_status',
      // Tasks
      'idx_tasks_project_id',
      'idx_tasks_assignee_id',
      'idx_tasks_status',
      'idx_tasks_priority',
      'idx_tasks_due_date',
      'idx_tasks_project_status',
      'idx_tasks_assignee_status',
      // Time entries
      'idx_time_entries_user_id',
      'idx_time_entries_project_id',
      'idx_time_entries_task_id',
      'idx_time_entries_start_time',
      'idx_time_entries_end_time',
      'idx_time_entries_user_date',
      'idx_time_entries_project_date',
      // Invoices
      'idx_invoices_client_id',
      'idx_invoices_project_id',
      'idx_invoices_status',
      'idx_invoices_invoice_number',
      'idx_invoices_issue_date',
      'idx_invoices_due_date',
      'idx_invoices_client_status',
      // Audit logs
      'idx_audit_logs_entity_type',
      'idx_audit_logs_entity_id',
      'idx_audit_logs_user_id',
      'idx_audit_logs_action',
      'idx_audit_logs_created_at',
      'idx_audit_logs_entity_user',
      // Clients
      'idx_clients_name',
      'idx_clients_email',
      'idx_clients_status',
      'idx_clients_created_at',
      // Notifications
      'idx_notifications_user_id',
      'idx_notifications_read',
      'idx_notifications_created_at',
      'idx_notifications_user_unread',
      // Comments
      'idx_comments_task_id',
      'idx_comments_project_id',
      'idx_comments_user_id',
      'idx_comments_created_at',
      // Refresh tokens
      'idx_refresh_tokens_user_id',
      'idx_refresh_tokens_expires_at',
      'idx_refresh_tokens_revoked',
    ];

    for (const index of indexes) {
      await queryRunner.query(`DROP INDEX IF EXISTS ${index};`);
    }

    console.log('Performance indexes dropped successfully');
  }
}
