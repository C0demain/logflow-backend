import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { Repository } from "typeorm";
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceOrder } from './entities/service-order.entity';
import { ListServiceOrderDto } from './dto/list-service-order.dto';

@Injectable()
export class ServiceOrderService {

  constructor(
    @InjectRepository(ServiceOrder) private readonly serviceOrderRepository: Repository<ServiceOrder>
  ){}

  async create(createServiceOrderDto: CreateServiceOrderDto) {
    const serviceDb = new ServiceOrder();

    serviceDb.title = createServiceOrderDto.title;
    serviceDb.clientRelated = createServiceOrderDto.clientRelated;
    serviceDb.status = createServiceOrderDto.status;
    serviceDb.expirationDate = createServiceOrderDto.expirationDate;

    return await this.serviceOrderRepository.save(serviceDb);
    
  }

  async findAll() {
    const orders = await this.serviceOrderRepository.find();

    if(!orders){
      throw new InternalServerErrorException();
    }

    const ordersList = orders.map(
      (serviceOrder) => new ListServiceOrderDto(
        serviceOrder.id,
        serviceOrder.title, 
        serviceOrder.clientRelated, 
        serviceOrder.expirationDate, 
        serviceOrder.status
      )
    );

    return ordersList;
  }

  async findById(id: string) {
    const orderFound = await this.serviceOrderRepository.findOne({
      where:{id}
    });

    if(!orderFound){
      throw new NotFoundException(`Ordem de serviço com id: ${id}, não encontrada`);
    }

    return orderFound;
  }

  async findByTitle(title: string){
    const orderFound = await this.serviceOrderRepository.findOne({
      where:{title}
    });

    if(!orderFound){
      throw new NotFoundException(`Ordem de serviço com titulo: ${title}, não encontrada`);
    }

    return orderFound;
  }

  async update(id: string, newOrderData: UpdateServiceOrderDto) {
    const orderFound = await this.serviceOrderRepository.findOne({
      where:{id}
    });

    if(!orderFound){
      throw new NotFoundException(`Ordem de serviço com id: ${id}, não encontrada`);
    }

    Object.assign(orderFound, newOrderData as ServiceOrder);

    return await this.serviceOrderRepository.save(orderFound);
  }

  async remove(id: string) {
    const orderFound = await this.serviceOrderRepository.findOne({
      where:{id}
    });

    if(!orderFound){
      throw new NotFoundException(`Ordem de serviço com id: ${id}, não encontrada`);
    }

    await this.serviceOrderRepository.delete(orderFound.id);

    return orderFound;
  }
}
