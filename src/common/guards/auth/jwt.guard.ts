// JWT Auth Guard
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        // TODO: Implement JWT validation
        return true;
    }
}
