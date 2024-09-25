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
import { ListUsersDTO } from './dto/ListUser.dto';
import { CreateUserDTO } from './dto/CreateUser.dto';
import { UserService } from './user.service';
import { UpdateUserDTO } from './dto/UpdateUser.dto';
import { HashPasswordPipe } from 'src/resources/pipes/hashPassword';
import { AuthenticationGuard } from '../auth/authentication.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/enums/roles.enum';

@ApiTags('users')
@ApiBearerAuth()
@Controller('/api/v1/users')
@UseGuards(AuthenticationGuard, RolesGuard)
@Roles(Role.MANAGER)
export class UserController {
  constructor(private userService: UserService) { }

  @Post()
  @ApiOperation({ summary: 'Criar usuário', description: 'Rota acessível apenas para administradores' })
  async createUser(
    @Body() { name, email, role, sector }: CreateUserDTO,
    @Body('password', HashPasswordPipe) hashedPassword: string,
  ) {
    const userCreated = await this.userService.createUser({
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
      sector: sector
    });

    return {
      message: 'Usuário criado com sucesso.',
      user: new ListUsersDTO(
        userCreated.id,
        userCreated.name,
        userCreated.role,
      ),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários', description: 'Rota acessível apenas para administradores' })
  async listUsers() {
    const usersSaved = await this.userService.listUsers();

    return {
      message: 'Usuários obtidos com sucesso.',
      users: usersSaved,
    };
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Atualizar usuário', description: 'Rota acessível apenas para administradores' })
  async updateUser(@Param('id') id: string, @Body() newData: UpdateUserDTO) {
    const userUpdated = await this.userService.updateUser(id, newData);

    return {
      message: 'Usuário atualizado com sucesso.',
      user: userUpdated,
    };
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Deletar usuário', description: 'Rota acessível apenas para administradores' })
  async removeUser(@Param('id') id: string) {
    const userRemoved = await this.userService.deleteUser(id);

    return {
      message: 'Usuário removido com sucesso.',
      user: userRemoved,
    };
  }
}
