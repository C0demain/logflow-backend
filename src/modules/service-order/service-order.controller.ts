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
import { Sector } from './enums/sector.enum';

@ApiTags('service-order')
@UseGuards(AuthenticationGuard)
@Controller('/api/v1/service-order')
@ApiBearerAuth()
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) { }

  @Post()
  @ApiOperation({ summary: 'Criar ordem de serviço' })
  async create(@Body() createServiceOrderDto: CreateServiceOrderDto) {
    const { clientId, status, processId, sector, userId, description, value } = createServiceOrderDto;

    const orderCreated = await this.serviceOrderService.create({
      clientId,
      processId,
      status,
      sector,
      userId,
      description,
      value
    });

    return {
      message: 'Ordem de serviço cadastrada.',
      serviceOrder: new ListServiceOrderDto(
        orderCreated.id,
        orderCreated.code,
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
          userRole: orderCreated.user.role.name,
        },
        orderCreated.description,
        orderCreated.value
      ),
    };
  }

  @Get("/")
  @ApiOperation({
    summary: 'Listar todos as ordens de serviço',
    description: 'Rota acessível apenas para administradores',
  })
  @ApiQuery({ name: 'id', required: false, type: String })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({ name: 'clientRelated', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({name: 'createdFrom', required: false, type: Date})
  @ApiQuery({name: 'createdTo', required: false, type: Date})
  async findAllOrders(
    @Query('id') id?: string,
    @Query('code') code?: string,
    @Query('status') status?: string,
    @Query('active') active?: boolean,
    @Query('createdFrom') createdFrom?: Date,
    @Query('createdTo') createdTo?: Date,
  ) {
    try {
      const orders = await this.serviceOrderService.findAll({
        id,
        code,
        status,
        active,
        createdFrom,
        createdTo,
      });

      if (!orders || orders.length === 0) {
        return {
          message: 'Nenhuma ordem de serviço encontrada.',
          orders: orders,
        };
      }

      return {
        message: 'Ordens de serviço encontradas.',
        orders: orders,
      };
    } catch (error) {
      return {
        message: 'Nenhuma ordem de serviço encontrada.',
        orders: [],
      };
    }
  }


  @Get('history')
  @ApiOperation({
    summary: 'Listar todos os logs de ordens de serviço',
    description: 'Rota acessível apenas para administradores',
  })
  @ApiQuery({ name: 'id', required: false, type: String })
  @ApiQuery({ name: 'serviceOrderId', required: false, type: String })
  async findAllLogs(
    @Query('id') id?: string,
    @Query('serviceOrderId') serviceOrderId?: string,
  ) {
    const logs = await this.serviceOrderService.getLogs({
      id,
      serviceOrderId,
    });
  
    if (!logs || logs.length === 0) {
      return {
        message: 'Nenhum log de ordem de serviço encontrado.',
        logs: [],
      };
    }
  
    return {
      message: 'Logs de ordens de serviço encontrados.',
      logs: logs,
    };
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Calcular totais das ordens de serviço e tarefas',
    description: 'Rota acessível apenas para administradores',
  })
  @ApiQuery({ name: 'id', required: false, type: String })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'sector', required: false, type: String })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  async calculateTotals(
    @Query('id') id?: string,
    @Query('code') code?: string,
    @Query('status') status?: string,
    @Query('sector') sector?: string,
    @Query('active') active?: boolean,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters = {
      id,
      code,
      status,
      sector,
      active,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };

    return this.serviceOrderService.calculateValues(filters);
  }

  @Get('dashboard/monthly')
  @ApiOperation({
    summary: 'Calcular totais mensais das ordens de serviço e tarefas',
    description: 'Rota acessível apenas para administradores',
  })
  @ApiQuery({ name: 'id', required: false, type: String })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'sector', required: false, type: String })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  async calculateMonthlyTotals(
    @Query('id') id?: string,
    @Query('code') code?: string,
    @Query('status') status?: string,
    @Query('sector') sector?: string,
    @Query('active') active?: boolean,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters = {
      id,
      code,
      status,
      sector,
      active,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };

    return this.serviceOrderService.calculateMonthlyValues(filters);
}


  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma ordem de serviço' })
  async update(
    @Param('id') id: string,
    @Body() newData: UpdateServiceOrderDto,
  ) {
    const orderUpdated = await this.serviceOrderService.update(id, newData);

    return {
      message: `Ordem de serviço atualizada.`,
      serviceOrder: orderUpdated,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Deletar uma ordem de serviço',
    description: 'Rota acessível apenas para administradores',
  })
  async remove(@Param('id') id: string) {
    const orderRemoved = await this.serviceOrderService.remove(id);

    return {
      message: `Ordem de serviço deletada.`,
      serviceOrder: orderRemoved,
    };
  }
}
