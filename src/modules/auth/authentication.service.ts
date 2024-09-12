import { JwtService } from '@nestjs/jwt';
import { UserService } from "../user/user.service";
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export interface UserPayload {
    sub: string,
    username: string
}

@Injectable()
export class AuthenticationService {

    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ){}

    async login(email: string, password: string){
        const user = await this.userService.findByEmail(email);

        const userAuthenticated = await bcrypt.compare(password, user.password);

        if(!userAuthenticated){
            throw new UnauthorizedException("The email or password is incorrect.");
        }

        const payload : UserPayload = {
            sub: user.id,
            username: user.name
        }

        return {
            token: await this.jwtService.signAsync(payload),
        }
    }
}