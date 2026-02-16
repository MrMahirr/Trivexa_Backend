export interface PaginationOptions {
    page: number;
    limit: number;
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        lastPage: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export const getPaginationSql = (options: PaginationOptions, paramIndex: number): { sql: string; values: number[] } => {
    const limit = Math.max(1, options.limit);
    const page = Math.max(1, options.page);
    const offset = (page - 1) * limit;

    return {
        sql: `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        values: [limit, offset],
    };
};
