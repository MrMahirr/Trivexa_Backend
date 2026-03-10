import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        -- Invoices
        CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);
        CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);

        -- Invoice Items
        CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

        -- Payments
        CREATE INDEX IF NOT EXISTS idx_payments_recorded_by ON payments(recorded_by);

        -- Expenses
        CREATE INDEX IF NOT EXISTS idx_expenses_requested_by ON expenses(requested_by);
        CREATE INDEX IF NOT EXISTS idx_expenses_approved_by ON expenses(approved_by);

        -- Contracts
        CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
        CREATE INDEX IF NOT EXISTS idx_contracts_created_by ON contracts(created_by);

        -- Meetings
        CREATE INDEX IF NOT EXISTS idx_meetings_client_id ON meetings(client_id);
        CREATE INDEX IF NOT EXISTS idx_meetings_project_id ON meetings(project_id);
        CREATE INDEX IF NOT EXISTS idx_meetings_organizer_id ON meetings(organizer_id);

        -- Files
        CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        DROP INDEX IF EXISTS idx_invoices_created_by;
        DROP INDEX IF EXISTS idx_invoices_project_id;
        DROP INDEX IF EXISTS idx_invoice_items_invoice_id;
        DROP INDEX IF EXISTS idx_payments_recorded_by;
        DROP INDEX IF EXISTS idx_expenses_requested_by;
        DROP INDEX IF EXISTS idx_expenses_approved_by;
        DROP INDEX IF EXISTS idx_contracts_client_id;
        DROP INDEX IF EXISTS idx_contracts_created_by;
        DROP INDEX IF EXISTS idx_meetings_client_id;
        DROP INDEX IF EXISTS idx_meetings_project_id;
        DROP INDEX IF EXISTS idx_meetings_organizer_id;
        DROP INDEX IF EXISTS idx_files_uploaded_by;
    `);
}
