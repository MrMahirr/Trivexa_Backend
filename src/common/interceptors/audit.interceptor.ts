import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { WriteAuditLogUseCase } from '../../modules/audit/application/usecases/write-audit-log.usecase';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly writeAuditLogUseCase: WriteAuditLogUseCase,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const method = req.method;
    const url = req.url;

    // Skip GET requests or if no user (public endpoints)
    if (method === 'GET' || !user) {
      return next.handle();
    }

    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const resource =
      this.reflector.get<string>('resource', context.getHandler()) ||
      url.split('/')[1] ||
      'UNKNOWN';
    const action = `${method} ${url}`;

    return next.handle().pipe(
      tap(async (data) => {
        // Log successful modification
        // If it's a POST/PUT/PATCH/DELETE
        try {
          await this.writeAuditLogUseCase.execute({
            userId: user.userId,
            action: method,
            resource: resource,
            resourceId: req.params.id || (data && data.id) || null,
            ipAddress: ip,
            userAgent: userAgent,
            // Store the request body (what the user sent) instead of the response data
            newData:
              method !== 'DELETE'
                ? req.body && Object.keys(req.body).length > 0
                  ? req.body
                  : data
                : null,
          });
        } catch (error) {
          console.error('Audit Log Error:', error);
          // Don't fail the request if audit logging fails
        }
      }),
    );
  }
}
