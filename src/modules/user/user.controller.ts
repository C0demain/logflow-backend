import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HashPasswordPipe } from 'src/resources/pipes/hashPassword';
import { AuthenticationGuard } from '../auth/authentication.guard';
import { Role } from '../roles/enums/roles.enum';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { CreateUserDTO } from './dto/CreateUser.dto';
import { ListUsersDTO } from './dto/ListUser.dto';
import { UpdateUserDTO } from './dto/UpdateUser.dto';
import { UserService } from './user.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('/api/v1/users')
@UseGuards(AuthenticationGuard, RolesGuard)
@Roles(Role.MANAGER)
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Criar usuário' })
  async createUser(
    @Body() createUserDTO: CreateUserDTO,
    @Body('password', HashPasswordPipe) hashedPassword: string,
  ) {
    const { name, email } = createUserDTO;

    @Post()
    @ApiOperation({ summary: "Criar usuário" })
    async createUser(
        @Body() { name, email }: CreateUserDTO,
        @Body("password", HashPasswordPipe) hashedPassword: string,
    ) {

    return {
      message: 'Usuário criado com sucesso.',
      user: new ListUsersDTO(userCreated.id, userCreated.name),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @Roles(Role.MANAGER)
  async listUsers() {
    const usersSaved = await this.userService.listUsers();

    return {
      message: 'Usuários obtidos com sucesso.',
      users: usersSaved,
    };
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Listar um usuário' })
  @Roles(Role.USER)
  async listUser(@Param('id') id: string) {
    const usersSaved = await this.userService.listUsers();

    return {
      message: 'Usuários obtidos com sucesso.',
      users: usersSaved[0],
    };
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  async updateUser(@Param('id') id: string, @Body() newData: UpdateUserDTO) {
    const userUpdated = await this.userService.updateUser(id, newData);

    return {
      message: 'Usuário atualizado com sucesso.',
      user: userUpdated,
    };
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Deletar usuário' })
  async removeUser(@Param('id') id: string) {
    const userRemoved = await this.userService.deleteUser(id);

    return {
      message: 'Usuário removido com sucesso.',
      user: userRemoved,
    };
  }
}
