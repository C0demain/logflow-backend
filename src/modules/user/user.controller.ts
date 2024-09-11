import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from "@nestjs/common";
import { ListUsersDTO } from "./dto/ListUser.dto";
import { CreateUserDTO } from "./dto/CreateUser.dto";
import { UserService } from "./user.service";
import { UpdateUserDTO } from "./dto/UpdateUser.dto";
import { HashPasswordPipe } from "src/resources/pipes/hashPassword";
import { AuthenticationGuard } from "../auth/authentication.guard";

@Controller("/api/v1/users")
@UseGuards(AuthenticationGuard)
export class UserController {

    constructor(private userService: UserService) { }

    @Post()
    async createUser(
        @Body() createUserDTO: CreateUserDTO,
        @Body("password", HashPasswordPipe) hashedPassword: string,
    ) {
        const { name, email } = createUserDTO;

        const userCreated = await this.userService.createUser({
            name: name,
            email: email,
            password: hashedPassword,
        });

        return {
            message: "User created successfully.",
            user: new ListUsersDTO(userCreated.id, userCreated.name),
        };
    }

    @Get()
    async listUsers() {
        const usersSaved = await this.userService.listUsers();

        return {
            message: "Users successfully obtained.",
            users: usersSaved,
        };
    }

    @Put("/:id")
    async updateUser(@Param("id") id: string, @Body() newData: UpdateUserDTO) {
        const userUpdated = await this.userService.updateUser(id, newData);

        return {
            message: "User updated successfully.",
            user: userUpdated,
        };
    }

    @Delete("/:id")
    async removeUser(@Param("id") id: string) {
        const userRemoved = await this.userService.deleteUser(id);

        return {
            message: "User removed successfully.",
            user: userRemoved,
        };
    }
}