export interface PaginationResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export function getPaginationParams(query: any): { page: number; limit: number; offset: number } {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '10', 10)));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
}

export function createPaginationResult<T>(data: T[], total: number, page: number, limit: number): PaginationResult<T> {
    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}
