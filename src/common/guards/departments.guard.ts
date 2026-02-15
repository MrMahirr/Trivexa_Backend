import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DEPARTMENTS_KEY } from '../decorators/departments.decorator';

@Injectable()
export class DepartmentsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredDepts = this.reflector.getAllAndOverride<string[]>(
            DEPARTMENTS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredDepts || requiredDepts.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        if (!user || !requiredDepts.includes(user.department)) {
            throw new ForbiddenException('Insufficient department permissions');
        }

        return true;
    }
}
