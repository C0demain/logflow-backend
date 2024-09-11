import { Injectable } from '@nestjs/common';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { Repository } from "typeorm";
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceOrder } from './entities/service-order.entity';

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

  findAll() {
    return `This action returns all serviceOrder`;
  }

  findOne(id: string) {
    return `This action returns a #${id} serviceOrder`;
  }

  update(id: string, updateServiceOrderDto: UpdateServiceOrderDto) {
    return `This action updates a #${id} serviceOrder`;
  }

  remove(id: string) {
    return `This action removes a #${id} serviceOrder`;
  }
}
