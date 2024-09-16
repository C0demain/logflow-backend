import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HashPasswordPipe } from 'src/resources/pipes/hashPassword';
import { CreateRoleDTO } from './dto/create-role.dto';
import { RolesService } from './roles.service';
import { ListRoleDTO } from './dto/list-role.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('/api/v1/roles')
// @UseGuards(AuthenticationGuard)
export class RolesController {
  constructor(private roleService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar função' })
  async createRole(@Body() createRoleDTO: CreateRoleDTO) {
    const { name } = createRoleDTO;

    const roleCreated = await this.roleService.createRole({
      name: name,
    });

    return {
      message: 'Função criada com sucesso.',
      user: new ListRoleDTO(roleCreated.id, roleCreated.name),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as funções' })
  async listRoles() {
    const rolesSaved = await this.roleService.listRoles();

    return {
      message: 'Funções listadas com sucesso.',
      users: rolesSaved,
    };
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Atualizar função' })
  async updateRole(@Param('id') id: number, @Body() newData: UpdateRoleDTO) {
    const roleUpdated = await this.roleService.updateRole(id, newData);

    return {
      message: 'Função atualizada com sucesso.',
      user: roleUpdated,
    };
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Deletar função' })
  async removeUser(@Param('id') id: number) {
    const userRemoved = await this.roleService.deleteRole(id);

    return {
      message: 'Função removida com sucesso.',
      user: userRemoved,
    };
  }
}
