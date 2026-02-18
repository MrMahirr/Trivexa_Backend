import { PAGINATION } from '../constants/pagination.constants';

export class PaginationUtil {
    static createPageMeta(pageOptionsDto: { page: number; limit: number }, itemCount: number) {
        const page = pageOptionsDto.page || PAGINATION.DEFAULT_PAGE;
        const limit = pageOptionsDto.limit || PAGINATION.DEFAULT_LIMIT;
        const pageCount = Math.ceil(itemCount / limit);
        const hasPreviousPage = page > 1;
        const hasNextPage = page < pageCount;

        return {
            page,
            limit,
            itemCount,
            pageCount,
            hasPreviousPage,
            hasNextPage,
        };
    }
}
