import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/modules/roles/enums/roles.enum';
import { RequestUser } from '../auth/authentication.guard';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestUser>();
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const userRole = request.user.roles;

    if (!requiredRoles) {
      return true;
    }

    if (userRole == Role.MANAGER) {
      return true;
    }

    if (requiredRoles.some((role) => userRole.includes(role))) {
      return true;
    } else {
      throw new UnauthorizedException('Usuário sem permissão');
    }
  }
}
