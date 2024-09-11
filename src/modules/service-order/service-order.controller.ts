import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServiceOrderService } from './service-order.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ListServiceOrderDto } from './dto/list-service-order.dto';
import { format } from 'date-fns';

@Controller('/api/v1/service-order')
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Post()
  async create(@Body() createServiceOrderDto: CreateServiceOrderDto) {
    const {title, clientRelated, expirationDate, status} = createServiceOrderDto;

    const orderCreated = await this.serviceOrderService.create({
      title: title,
      clientRelated: clientRelated,
      expirationDate: expirationDate,
      status:status
    })

    const formattedExpirationDate = format(new Date(orderCreated.expirationDate), 'dd/MM/yyyy');

    return{
      message: "ordem de serviço cadastrada",
      serviceOrder: new ListServiceOrderDto(
        orderCreated.title, 
        orderCreated.clientRelated, 
        formattedExpirationDate, 
        orderCreated.status
      )
    };
  }

  @Get()
  findAll() {
    return this.serviceOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceOrderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceOrderDto: UpdateServiceOrderDto) {
    return this.serviceOrderService.update(id, updateServiceOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceOrderService.remove(id);
  }
}
