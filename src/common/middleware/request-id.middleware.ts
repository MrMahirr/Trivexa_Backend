import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const headerName = 'x-request-id';
    // Use existing request ID or generate a new one
    const requestId = req.get(headerName) || uuidv4();

    // Attach to request object for downstream use
    req.headers[headerName] = requestId;

    // Set response header
    res.setHeader(headerName, requestId);

    next();
  }
}
