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
import * as fs from 'fs';
import { DomainError, DomainErrorType } from '../../shared/errors/domain.error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    // Try to map PG errors first
    try {
      PgErrorMapper.map(exception);
    } catch (mappedException) {
      if (mappedException instanceof HttpException) {
        exception = mappedException;
      }
    }

    if (exception instanceof DomainError) {
      status = this.mapDomainErrorToHttpStatus(exception.type);
      message = {
        message: exception.message,
        error: exception.type,
        code: exception.code,
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = exceptionResponse;
    } else if (exception instanceof Error) {
      if (process.env.NODE_ENV === 'production') {
        this.logger.error(
          JSON.stringify({
            message: `Unexpected error: ${exception.message}`,
            stack: exception.stack,
            path: request.url,
            method: request.method,
            requestId: request.headers['x-request-id'],
          }),
        );
        fs.appendFileSync('error-debug.log', exception.stack + '\\n\\n');
      } else {
        this.logger.error(
          `Unexpected error: ${exception.message}`,
          exception.stack,
        );
        fs.appendFileSync('error-debug.log', exception.stack + '\\n\\n');
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

  private mapDomainErrorToHttpStatus(type: DomainErrorType): HttpStatus {
    switch (type) {
      case DomainErrorType.NOT_FOUND:
        return HttpStatus.NOT_FOUND;
      case DomainErrorType.CONFLICT:
        return HttpStatus.CONFLICT;
      case DomainErrorType.UNAUTHORIZED:
        return HttpStatus.UNAUTHORIZED;
      case DomainErrorType.FORBIDDEN:
        return HttpStatus.FORBIDDEN;
      case DomainErrorType.BUSINESS_RULE:
        return HttpStatus.BAD_REQUEST;
      case DomainErrorType.INTERNAL_ERROR:
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
