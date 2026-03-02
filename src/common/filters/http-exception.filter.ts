import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * HttpExceptionFilter — Sadece HttpException türündeki hataları yakalar.
 * Production ortamında kullanıcıya stack trace göstermez,
 * standart JSON formatında hata döner.
 *
 * GlobalExceptionFilter (tüm hatalar) zaten mevcuttur;
 * bu filter belirli bir modüle veya controller'a @UseFilters() ile
 * bağlanarak özelleştirilmiş hata yanıtları vermek için kullanılır.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Mesajı çöz
    let message: string | string[];
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, unknown>;
      message = (resp.message as string | string[]) || exception.message;
    } else {
      message = exceptionResponse as string;
    }

    // Development ortamında detaylı log
    if (process.env.NODE_ENV !== 'production') {
      this.logger.warn(
        `[${request.method}] ${request.url} → ${status} ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
