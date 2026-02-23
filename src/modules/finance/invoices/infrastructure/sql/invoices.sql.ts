export const InvoicesSql = {
  insertInvoice: `
        INSERT INTO invoices (
            invoice_number, client_id, project_id, status, subtotal, tax_rate, tax_amount, total, 
            issue_date, due_date, notes, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *;
    `,

  insertInvoiceItem: `
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `,

  findAll: `
        SELECT i.*, 
               c.company_name as client_name,
               p.name as project_name
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        LEFT JOIN projects p ON i.project_id = p.id
        WHERE 1=1
    `,

  findById: `
        SELECT i.*, 
               c.company_name as client_name,
               p.name as project_name
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        LEFT JOIN projects p ON i.project_id = p.id
        WHERE i.id = $1
    `,

  findItemsByInvoiceId: `SELECT * FROM invoice_items WHERE invoice_id = $1`,

  updateStatus: `UPDATE invoices SET status = $1 WHERE id = $2 RETURNING *`,

  countByYear: `SELECT count(*) as count FROM invoices WHERE EXTRACT(YEAR FROM created_at) = $1`,

  sumByDateRange: `
        SELECT 
            COALESCE(SUM(total), 0) as total_issued,
            COALESCE(SUM(CASE WHEN status = 'PAID' THEN total 
                              WHEN status = 'PARTIALLY_PAID' THEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = invoices.id)
                              ELSE 0 END), 0) as total_collected
        FROM invoices 
        WHERE issue_date >= $1 AND issue_date <= $2
    `,
};
