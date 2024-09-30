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
import { ServiceOrderService } from './service-order.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ListServiceOrderDto } from './dto/list-service-order.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticationGuard } from '../auth/authentication.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/enums/roles.enum';

@ApiTags('service-order')
@UseGuards(AuthenticationGuard)
@Controller('/api/v1/service-order')
@ApiBearerAuth()
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Criar ordem de serviço' })
  async create(@Body() createServiceOrderDto: CreateServiceOrderDto) {
    const { title, clientId, status, sector, userId } = createServiceOrderDto;

    const orderCreated = await this.serviceOrderService.create({
      title: title,
      clientId: clientId,
      status: status,
      sector: sector,
      userId: userId,
    });

    return {
      message: 'ordem de serviço cadastrada',
      serviceOrder: new ListServiceOrderDto(
        orderCreated.id,
        orderCreated.title,
        {
          clientId: orderCreated.client.id,
          clientName: orderCreated.client.name,
          clientEmail: orderCreated.client.email,
          clientCnpj: orderCreated.client.cnpj,
        },
        orderCreated.status,
        orderCreated.sector,
        {
          userId: orderCreated.user.id,
          userName: orderCreated.user.name,
          userEmail: orderCreated.user.email,
          userRole: orderCreated.user.role,
        },
      ),
    };
  }

  @Get()
  @Roles(Role.MANAGER)
  @ApiOperation({
    summary: 'Listar todos as ordens de serviço',
    description: 'Rota acessível apenas para administradores',
  })
  @ApiQuery({ name: 'id', required: false, type: String })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'clientRelated', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  async findAllOrders(
    @Query('id') id?: string,
    @Query('title') title?: string,
    @Query('status') status?: string,
    @Query('active') active?: boolean,
  ) {
    try {
      const orders = await this.serviceOrderService.findAll({
        id,
        title,
        status,
        active,
      });

      if (!orders || orders.length === 0) {
        return {
          message: 'Nenhuma ordem de serviço encontrada',
          orders: orders,
        };
      }

      return {
        message: 'Ordens de serviço encontradas',
        orders: orders,
      };
    } catch (error) {
      return {
        message: 'Nenhuma ordem de serviço encontrada',
        orders: [],
      };
    }
  }

  @Get('/:sector')
  @ApiOperation({ summary: 'Listar ordens de serviço por setor' })
  async findOrdersBySector(@Param('sector') sector: string) {
    try {
      const ordersBySector = await this.serviceOrderService.findAll({
        sector: sector,
      });

      if (!ordersBySector || ordersBySector.length === 0) {
        return {
          message: `Nenhuma ordem de serviço encontrada para o setor: ${sector}`,
          orders: ordersBySector,
        };
      }

      return {
        message: `Ordens de serviço do setor ${sector} encontradas`,
        orders: ordersBySector,
      };
    } catch (error) {
      return {
        message: 'Nenhuma ordem de serviço encontrada',
        orders: [],
      };
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma ordem de serviço' })
  async update(
    @Param('id') id: string,
    @Body() newData: UpdateServiceOrderDto,
  ) {
    const orderUpdated = await this.serviceOrderService.update(id, newData);

    return {
      message: `ordem de serviço atualizada`,
      serviceOrder: orderUpdated,
    };
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  @ApiOperation({
    summary: 'Deletar uma ordem de serviço',
    description: 'Rota acessível apenas para administradores',
  })
  async remove(@Param('id') id: string) {
    const orderRemoved = await this.serviceOrderService.remove(id);

    return {
      message: `ordem de serviço deletada`,
      serviceOrder: orderRemoved,
    };
  }
}
