import { Controller, Get, Post, Body, Param, Delete, Put, InternalServerErrorException } from '@nestjs/common';
import { ServiceOrderService } from './service-order.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ListServiceOrderDto } from './dto/list-service-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';

@ApiTags("service-order")
@Controller('/api/v1/service-order')
export class ServiceOrderController {
  constructor(
    private readonly serviceOrderService: ServiceOrderService,
  ) {}

  @Post()
  async create(@Body() createServiceOrderDto: CreateServiceOrderDto) {
    const {title, clientRelated, expirationDate, status, userId} = createServiceOrderDto;

    const orderCreated = await this.serviceOrderService.create({
      title: title,
      clientRelated: clientRelated,
      expirationDate: expirationDate,
      status:status,
      userId: userId

    });

    return{
      message: "ordem de serviço cadastrada",
      serviceOrder: new ListServiceOrderDto(
        orderCreated.id,
        orderCreated.title, 
        orderCreated.clientRelated, 
        orderCreated.expirationDate, 
        orderCreated.status,
        {
          id: orderCreated.user.id,
          name: orderCreated.user.name,
          email: orderCreated.user.email
        }
      )
    };
  }

  @Get()
  async findAll() {
    const orders = await this.serviceOrderService.findAll();

    if(!orders){
      throw new InternalServerErrorException()
    }

    return {
      message: "Ordens de serviço encontradas",
      orders: orders
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const orderFound = await this.serviceOrderService.findById(id);

    return{
      message: `ordem de serviço com id: ${id} encontrada`,
      serviceOrder: orderFound
    }
  }

  @Get(':title')
  async findByTitle(@Param('title') title: string) {
    const orderFound = await this.serviceOrderService.findById(title);

    return{
      message: `ordem de serviço com titulo: ${title} encontrada`,
      serviceOrder: orderFound
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() newData: UpdateServiceOrderDto) {
    const orderUpdated = await this.serviceOrderService.update(id, newData);

    return{
      message: `ordem de serviço atualizada`,
      serviceOrder: orderUpdated
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const orderRemoved = await this.serviceOrderService.remove(id);

    return{
      message: `ordem de serviço deletada`,
      serviceOrder: orderRemoved
    }
  }
}
