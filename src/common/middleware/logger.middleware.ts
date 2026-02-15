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

            this.logger.log(
                `${method} ${baseUrl} ${statusCode} ${duration}ms - ${userAgent} ${ip} [${requestId}]`,
            );
        });

        next();
    }
}
