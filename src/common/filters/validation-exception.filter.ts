import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse: any = exception.getResponse();

        let errors = [];

        if (Array.isArray(exceptionResponse.message)) {
            errors = exceptionResponse.message;
        } else if (typeof exceptionResponse.message === 'string') {
            errors = [exceptionResponse.message];
        }

        response.status(status).json({
            statusCode: status,
            message: 'Validation failed',
            errors: errors,
            timestamp: new Date().toISOString(),
        });
    }
}
