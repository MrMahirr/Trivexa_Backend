import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

/**
 * Performance Indexes Migration
 *
 * Adds indexes to improve query performance on frequently accessed tables
 * Based on common query patterns and joins.
 * Tablo/kolon henüz yoksa ilgili index atlanır (şema sürümleri arasında güvenli).
 */
const INDEXES: Array<[name: string, definition: string]> = [
  // Users
  ['idx_users_email', 'users(email)'],
  ['idx_users_role', 'users(role)'],
  ['idx_users_department', 'users(department)'],
  ['idx_users_active', 'users(is_active)'],
  ['idx_users_created_at', 'users(created_at DESC)'],
  // Projects
  ['idx_projects_client_id', 'projects(client_id)'],
  ['idx_projects_status', 'projects(status)'],
  ['idx_projects_start_date', 'projects(start_date DESC)'],
  ['idx_projects_end_date', 'projects(end_date DESC)'],
  ['idx_projects_client_status', 'projects(client_id, status)'],
  // Tasks
  ['idx_tasks_project_id', 'tasks(project_id)'],
  ['idx_tasks_assignee_id', 'tasks(assignee_id)'],
  ['idx_tasks_status', 'tasks(status)'],
  ['idx_tasks_priority', 'tasks(priority)'],
  ['idx_tasks_due_date', 'tasks(due_date)'],
  ['idx_tasks_project_status', 'tasks(project_id, status)'],
  ['idx_tasks_assignee_status', 'tasks(assignee_id, status)'],
  // Time entries
  ['idx_time_entries_user_id', 'time_entries(user_id)'],
  ['idx_time_entries_project_id', 'time_entries(project_id)'],
  ['idx_time_entries_task_id', 'time_entries(task_id)'],
  ['idx_time_entries_start_time', 'time_entries(start_time DESC)'],
  ['idx_time_entries_end_time', 'time_entries(end_time DESC)'],
  ['idx_time_entries_user_date', 'time_entries(user_id, start_time DESC)'],
  ['idx_time_entries_project_date', 'time_entries(project_id, start_time DESC)'],
  // Invoices
  ['idx_invoices_client_id', 'invoices(client_id)'],
  ['idx_invoices_project_id', 'invoices(project_id)'],
  ['idx_invoices_status', 'invoices(status)'],
  ['idx_invoices_invoice_number', 'invoices(invoice_number)'],
  ['idx_invoices_issue_date', 'invoices(issue_date DESC)'],
  ['idx_invoices_due_date', 'invoices(due_date)'],
  ['idx_invoices_client_status', 'invoices(client_id, status)'],
  // Audit logs
  ['idx_audit_logs_entity_type', 'audit_logs(entity_type)'],
  ['idx_audit_logs_entity_id', 'audit_logs(entity_id)'],
  ['idx_audit_logs_user_id', 'audit_logs(user_id)'],
  ['idx_audit_logs_action', 'audit_logs(action)'],
  ['idx_audit_logs_created_at', 'audit_logs(created_at DESC)'],
  ['idx_audit_logs_entity_user', 'audit_logs(entity_type, entity_id, user_id)'],
  // Clients
  ['idx_clients_name', 'clients(name)'],
  ['idx_clients_email', 'clients(email)'],
  ['idx_clients_status', 'clients(status)'],
  ['idx_clients_created_at', 'clients(created_at DESC)'],
  // Notifications
  ['idx_notifications_user_id', 'notifications(user_id)'],
  ['idx_notifications_read', 'notifications(is_read)'],
  ['idx_notifications_created_at', 'notifications(created_at DESC)'],
  ['idx_notifications_user_unread', 'notifications(user_id, is_read, created_at DESC)'],
  // Comments
  ['idx_comments_task_id', 'comments(task_id) WHERE task_id IS NOT NULL'],
  ['idx_comments_project_id', 'comments(project_id) WHERE project_id IS NOT NULL'],
  ['idx_comments_user_id', 'comments(user_id)'],
  ['idx_comments_created_at', 'comments(created_at DESC)'],
  // Refresh tokens
  ['idx_refresh_tokens_user_id', 'refresh_tokens(user_id)'],
  ['idx_refresh_tokens_expires_at', 'refresh_tokens(expires_at)'],
  ['idx_refresh_tokens_revoked', 'refresh_tokens(is_revoked)'],
];

export async function up(pgm: MigrationBuilder): Promise<void> {
  for (const [name, definition] of INDEXES) {
    pgm.sql(`
      DO $$
      BEGIN
        EXECUTE 'CREATE INDEX IF NOT EXISTS ${name} ON ${definition}';
      EXCEPTION
        WHEN undefined_table OR undefined_column THEN
          RAISE NOTICE 'Skipping index ${name}: table/column missing';
      END
      $$;
    `);
  }
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  for (const [name] of INDEXES) {
    pgm.sql(`DROP INDEX IF EXISTS ${name};`);
  }
}
