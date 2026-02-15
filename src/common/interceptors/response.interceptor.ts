import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    success: boolean;
    statusCode: number;
    data: T;
    timestamp: string;
    path: string;
    requestId: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<Response<T>> {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const statusCode = response.statusCode;

        return next.handle().pipe(
            map((data) => ({
                success: true,
                statusCode,
                data,
                timestamp: new Date().toISOString(),
                path: request.url,
                requestId: request.headers['x-request-id'],
            })),
        );
    }
}
