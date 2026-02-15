import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PgErrorMapper } from '../../database/error-mapping/pg-error.mapper';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | object = 'Internal server error';
        let code: string | undefined;

        // Try to map PG errors first
        try {
            PgErrorMapper.map(exception);
        } catch (mappedException) {
            if (mappedException instanceof HttpException) {
                exception = mappedException;
            }
        }

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message = exceptionResponse;
        } else if (exception instanceof Error) {
            // Log unexpected errors
            this.logger.error(
                `Unexpected error: ${exception.message}`,
                exception.stack,
            );
            if (process.env.NODE_ENV !== 'production') {
                message = exception.message;
            }
        }

        const responseBody = {
            success: false,
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId: request.headers['x-request-id'],
        };

        response.status(status).json(responseBody);
    }
}
