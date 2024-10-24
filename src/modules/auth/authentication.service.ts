import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { Sector } from '../service-order/enums/sector.enum';
import { RoleEntity } from '../roles/roles.entity';

export interface UserPayload {
  sub: string;
  username: string;
  role: RoleEntity;
  sector: Sector;
}

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    const userAuthenticated = await bcrypt.compare(password, user.password);

    if (!userAuthenticated) {
      throw new UnauthorizedException('The email or password is incorrect.');
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('The user must be active.');
    }

    const payload: UserPayload = {
      sub: user.id,
      username: user.name,
      role: user.role,
      sector: user.sector
    };

    return {
      id: user.id,
      token: await this.jwtService.signAsync(payload),
      sector: user.sector,
      role: user.role.name
    };
  }
}
