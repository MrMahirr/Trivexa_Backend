import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as xss from 'xss';

@Injectable()
export class XssInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.body && typeof request.body === 'object') {
      this.sanitizeObject(request.body);
    }
    if (request.query && typeof request.query === 'object') {
      this.sanitizeObject(request.query);
    }
    if (request.params && typeof request.params === 'object') {
      this.sanitizeObject(request.params);
    }

    return next.handle();
  }

  private sanitizeObject(obj: any): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (typeof value === 'string') {
        obj[key] = xss.filterXSS(value);
      } else if (typeof value === 'object' && value !== null) {
        this.sanitizeObject(value);
      }
    });
  }
}
