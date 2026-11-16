import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../../entities/user.entity';

/**
 * Strict platform-operator gate.
 *
 * `RolesGuard` deliberately lets `super_admin`, `clinic_admin` and `admin`
 * through every `@Roles(...)` check. Platform-wide configuration (plan pricing,
 * other clinics' subscriptions) must not be reachable by a clinic admin, so
 * these routes use this guard instead.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    const roles: string[] = Array.isArray(user?.roles) ? user.roles : user?.role ? [user.role] : [];

    if (!roles.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Only a Vemtap super administrator can perform this action');
    }
    return true;
  }
}
