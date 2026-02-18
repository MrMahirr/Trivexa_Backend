import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../application/audit.service';
import { AUDIT_KEY } from '../../../../common/decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(
        private readonly reflector: Reflector,
        private readonly auditService: AuditService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const auditMeta = this.reflector.get(AUDIT_KEY, context.getHandler());
        if (!auditMeta) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const { method, ip, headers } = request;
        const userAgent = headers['user-agent'];
        const body = request.body;
        const params = request.params;
        const action = auditMeta.action || this.deriveAction(method);

        return next.handle().pipe(
            tap(async (data) => {
                const resourceId = params.id || data?.id || null;

                try {
                    await this.auditService.log({
                        userId: user?.userId || 'system',
                        action: action,
                        resource: auditMeta.resource,
                        resourceId: resourceId?.toString() || null, // Ensure string or handle mismatch
                        oldData: null,
                        newData: body,
                        ipAddress: ip,
                        userAgent: userAgent,
                    });
                } catch (error) {
                    console.error('Audit logging failed:', error);
                    // Fail silently to not disrupt the user flow? Or throw? usually silent for audit
                }
            }),
        );
    }

    private deriveAction(method: string): string {
        switch (method) {
            case 'POST': return 'CREATE';
            case 'PUT': return 'UPDATE';
            case 'PATCH': return 'UPDATE';
            case 'DELETE': return 'DELETE';
            default: return 'READ';
        }
    }
}
