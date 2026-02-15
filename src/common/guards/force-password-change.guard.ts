import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';

@Injectable()
export class ForcePasswordChangeGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (user?.forcePasswordChange) {
            const url = request.url;
            // Only allow access to change-password endpoint
            if (!url.includes('/auth/change-password')) {
                throw new ForbiddenException(
                    'You must change your password before accessing any other resource',
                );
            }
        }

        return true;
    }
}
