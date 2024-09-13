import { Body, Controller, Post } from "@nestjs/common";
import { AuthDTO } from "./dto/auth.dto";
import { AuthenticationService } from "./authentication.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("users")
@Controller('/api/v1/auth')
export class AuthenticationController{

    constructor(private readonly authenticationService: AuthenticationService){};

    @Post("/login")
    @ApiOperation({summary: "Login"})
    login(@Body() { email, password} : AuthDTO) {
        return this.authenticationService.login(email, password);
    }
}