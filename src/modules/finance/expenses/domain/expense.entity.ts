export enum ExpenseStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PAID = 'PAID',
}

export enum ExpenseCategory {
    OFFICE = 'OFFICE',
    TRAVEL = 'TRAVEL',
    SOFTWARE = 'SOFTWARE',
    MEALS = 'MEALS',
    OTHER = 'OTHER',
}

export interface ExpenseEntity {
    id: string;
    description: string;
    amount: number;
    expenseDate: Date;
    category: ExpenseCategory;
    status: ExpenseStatus;
    department: string;
    requestedBy: string;
    approvedBy?: string;
    receiptUrl?: string;
    createdAt: Date;
    updatedAt: Date;

    // joined
    requesterName?: string;
    approverName?: string;
}

export class Expense {
    static fromRow(row: any): ExpenseEntity {
        return {
            id: row.id,
            description: row.description,
            amount: parseFloat(row.amount),
            expenseDate: row.expense_date,
            category: row.category as ExpenseCategory,
            status: row.status as ExpenseStatus,
            department: row.department,
            requestedBy: row.requested_by,
            approvedBy: row.approved_by,
            receiptUrl: row.receipt_url,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            requesterName: row.requester_name,
            approverName: row.approver_name,
        };
    }
}
