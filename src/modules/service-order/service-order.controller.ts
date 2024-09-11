import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServiceOrderService } from './service-order.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';

@Controller('service-order')
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Post()
  create(@Body() createServiceOrderDto: CreateServiceOrderDto) {
    return this.serviceOrderService.create(createServiceOrderDto);
  }

  @Get()
  findAll() {
    return this.serviceOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceOrderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceOrderDto: UpdateServiceOrderDto) {
    return this.serviceOrderService.update(+id, updateServiceOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceOrderService.remove(+id);
  }
}
