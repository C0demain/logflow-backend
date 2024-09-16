import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/enums/roles.enum';
import { UserService } from '../user/user.service';

export interface UserPayload {
  sub: string;
  username: string;
  roles: Role[];
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

    const payload: UserPayload = {
      sub: user.id,
      username: user.name,
      roles: [Role.USER], //TODO: Relacionar com o banco
    };

    console.log(payload);

    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
}
