import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private normalizeRoleName(role: unknown): string {
    return typeof role === 'string' ? role.toUpperCase().trim() : '';
  }

  private isAccountingFamilyRole(role: string): boolean {
    return role.includes('ACCOUNTING') || role.includes('MUHASEBE');
  }

  private hasRequiredRole(userRole: unknown, requiredRoles: string[]): boolean {
    const normalizedUserRole = this.normalizeRoleName(userRole);
    if (!normalizedUserRole) {
      return false;
    }
    if (normalizedUserRole === 'ADMIN') {
      return true;
    }

    return requiredRoles.some((requiredRole) => {
      const normalizedRequiredRole = this.normalizeRoleName(requiredRole);
      if (normalizedUserRole === normalizedRequiredRole) {
        return true;
      }

      // ACCOUNTING yetkisi verilen endpointlerde muhasebe alt rolleri de erisebilsin.
      if (normalizedRequiredRole === 'ACCOUNTING') {
        return this.isAccountingFamilyRole(normalizedUserRole);
      }

      return false;
    });
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !this.hasRequiredRole(user.role, requiredRoles)) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    return true;
  }
}
