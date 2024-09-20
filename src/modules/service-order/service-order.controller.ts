import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  InternalServerErrorException,
  Query,
  NotFoundException,
  UseGuards
} from '@nestjs/common';
import { ServiceOrderService } from './service-order.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ListServiceOrderDto } from './dto/list-service-order.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from '../auth/authentication.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/enums/roles.enum';

@ApiTags("service-order")
@UseGuards(AuthenticationGuard)
@Controller('/api/v1/service-order')
export class ServiceOrderController {
  constructor(
    private readonly serviceOrderService: ServiceOrderService
  ) { }

  @Post()
  @ApiOperation({ summary:'Criar ordem de serviço' })
  async create(@Body() createServiceOrderDto: CreateServiceOrderDto) {
    const { title, clientRelated, status, sector, userId } = createServiceOrderDto;

    const orderCreated = await this.serviceOrderService.create({
      title: title,
      clientRelated: clientRelated,
      status: status,
      sector: sector,
      userId: userId
    });

    return {
      message: "ordem de serviço cadastrada",
      serviceOrder: new ListServiceOrderDto(
        orderCreated.id,
        orderCreated.title,
        orderCreated.clientRelated,
        orderCreated.status,
        orderCreated.sector,
        {
          id: orderCreated.user.id,
          name: orderCreated.user.name,
          email: orderCreated.user.email,
          role: orderCreated.user.role,
        }
      )
    };
  }

  @Get()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary:'Listar todos as ordens de serviço', description: 'Rota acessível apenas para administradores' })
  async findAllOrders(@Query('id') id?: string, @Query('title') title?: string, @Query('clientRelated') clientRelated?: string, @Query('status') status?: string) {
    
    const orders = await this.serviceOrderService.findAll({ id, title, clientRelated, status });

    if (!orders || orders.length === 0) {
      throw new InternalServerErrorException('Nenhuma ordem de serviço encontrada');
    }

    return {
      message: "Ordens de serviço encontradas",
      orders: orders,
    };
  }

  @Get('/:sector')
  @ApiOperation({ summary:'Listar ordens de serviço por setor' })
  async findOrdersBySector(@Param('sector') sector: string) {

    const ordersBySector = await this.serviceOrderService.findAll({
      sector: sector
    })

    if (!ordersBySector || ordersBySector.length === 0) {
      throw new NotFoundException('Nenhuma solicitação encontrada para o setor.');
    }

    return {
      message: `Ordens de serviço do setor ${sector} encontradas`,
      orders: ordersBySector,
    };
  }

  @Put(':id')
  @ApiOperation({ summary:'Atualizar uma ordem de serviço' })
  async update(@Param('id') id: string, @Body() newData: UpdateServiceOrderDto) {
    const orderUpdated = await this.serviceOrderService.update(id, newData);

    return {
      message: `ordem de serviço atualizada`,
      serviceOrder: orderUpdated
    }
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary:'Deletar uma ordem de serviço', description:'Rota acessível apenas para administradores' })
  async remove(@Param('id') id: string) {
    const orderRemoved = await this.serviceOrderService.remove(id);

    return {
      message: `ordem de serviço deletada`,
      serviceOrder: orderRemoved
    }
  }
}
