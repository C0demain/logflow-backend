import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticationGuard } from '../auth/authentication.guard';

@ApiTags('client')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard)
@Controller('/api/v1/client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @ApiOperation({ summary: 'Criar cliente' })
  async create(@Body() createClientDto: CreateClientDto) {
    const clientCreated = await this.clientService.create(createClientDto);
    return {
      message: 'Cliente cadastrado com sucesso',
      client: clientCreated,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiQuery({ name: 'id', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'cnpj', required: false })
  @ApiQuery({ name: 'active', required: false })
  async findAll(
    @Query('id') id?: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('cnpj') cnpj?: string,
    @Query('active') active?: boolean,
  ) {
    try {
      const clients = await this.clientService.findAll({
        id,
        name,
        email,
        cnpj,
        active,
      });

      return {
        message: 'Clientes encontrados',
        clients: clients,
      };
    } catch (error) {
      return {
        message: 'nenhum cliente encontrado',
        clients: [],
      };
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    const clientUpdated = await this.clientService.update(id, updateClientDto);

    return {
      message: 'Cliente atualizado com sucesso',
      client: clientUpdated,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover cliente' })
  async remove(@Param('id') id: string) {
    const {clientRemoved, message} = await this.clientService.remove(id);

    return {
      message,
      client: clientRemoved
    };
  }
}
