import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { ip, method, baseUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      const requestId = req.headers['x-request-id'];

      const message = `${method} ${baseUrl} ${statusCode} ${duration}ms - ${userAgent} ${ip} [${requestId}]`;

      if (process.env.NODE_ENV === 'production') {
        this.logger.log(
          JSON.stringify({
            method,
            url: baseUrl,
            statusCode,
            duration,
            userAgent,
            ip,
            requestId,
          }),
        );
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
