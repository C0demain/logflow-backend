import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestUser } from '../auth/authentication.guard';
import { ROLES_KEY } from './roles.decorator';
import { RoleEntity } from './roles.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestUser>();

    // Obtendo as roles requeridas para a rota
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const userRole: RoleEntity = request.user.role; // Supondo que o usuário tenha uma única role

    if (!requiredRoles) {
      return true;
    }

    // Verifica se o usuário é um Gerente Operacional
    if (this.isManager(userRole)) {
      return true;
    }

    // Verifica se a role do usuário está nas roles requeridas
    if (requiredRoles.includes(userRole.name)) {
      return true;
    } else {
      throw new UnauthorizedException('Usuário sem permissão');
    }
  }

  // Check geral para qualquer role
  private hasRole(userRole: RoleEntity, roleName: string): boolean {
    return userRole.name === roleName;
  }

  // Check específico para "Gerente Operacional"
  private isManager(userRole: RoleEntity): boolean {
    return this.hasRole(userRole, 'Gerente Operacional');
  }

  // Checks específicos para cada role
  private isVendedor(userRole: RoleEntity): boolean {
    return this.hasRole(userRole, 'Vendedor');
  }

  private isSAC(userRole: RoleEntity): boolean {
    return this.hasRole(userRole, 'SAC');
  }

  private isMotorista(userRole: RoleEntity): boolean {
    return this.hasRole(userRole, 'Motorista');
  }

  private isAnalistaLogistica(userRole: RoleEntity): boolean {
    return this.hasRole(userRole, 'Analista de Logística');
  }

  private isConsultoria(userRole: RoleEntity): boolean {
    return this.hasRole(userRole, 'Consultoria');
  }

  private isDiretorComercial(userRole: RoleEntity): boolean {
    return this.hasRole(userRole, 'Diretor Comercial');
  }

  private isDiretorAdministrativo(userRole: RoleEntity): boolean {
    return this.hasRole(userRole, 'Diretor Administrativo');
  }

  private isAnalistaRH(userRole: RoleEntity): boolean {
    return this.hasRole(userRole, 'Analista de RH');
  }

  private isAnalistaAdministrativoFinanceiro(userRole: RoleEntity): boolean {
    return this.hasRole(userRole, 'Analista Administrativo "Financeiro"');
  }

  private isAssRH(userRole: RoleEntity): boolean {
    return this.hasRole(userRole, 'Ass. Adminstrativo "RH"');
  }

  private isAssOperacional(userRole: RoleEntity): boolean {
    return this.hasRole(userRole, 'Ass. Administrativo "Operacional"');
  }

  private isAssFinanceiro(userRole: RoleEntity): boolean {
    return this.hasRole(userRole, 'Ass. Administrativo "Financeiro"');
  }
}
