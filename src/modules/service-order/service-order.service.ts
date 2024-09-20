import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { FindOptionsWhere, Repository } from "typeorm";
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceOrder } from './entities/service-order.entity';
import { ListServiceOrderDto } from './dto/list-service-order.dto';
import { UserService } from '../user/user.service';
import { Status } from './enums/status.enum';
import { Sector } from './enums/sector.enum';

@Injectable()
export class ServiceOrderService {

  constructor(
    @InjectRepository(ServiceOrder) private readonly serviceOrderRepository: Repository<ServiceOrder>,
    private readonly userService: UserService
  ){}

  async create(createServiceOrderDto: CreateServiceOrderDto) {
    const serviceDb = new ServiceOrder();

    const user = await this.userService.findById(createServiceOrderDto.userId);

    serviceDb.title = createServiceOrderDto.title;
    serviceDb.clientRelated = createServiceOrderDto.clientRelated;
    serviceDb.status = createServiceOrderDto.status;
    serviceDb.user = user;

    return await this.serviceOrderRepository.save(serviceDb);
    
  }

  async findAll(filters: { id?: string ,title?: string; clientRelated?: string; status?: string, sector?: string }) {
    // Construir a consulta dinamicamente
    const where: FindOptionsWhere<ServiceOrder> = {};
  
    if(filters.id){
      where.id = filters.id;
    }

    if (filters.title) {
      where.title = filters.title;
    }
  
    if (filters.clientRelated) {
      where.clientRelated = filters.clientRelated;
    }
  
    if (filters.status) {
      where.status = filters.status as Status; 
    }

    if (filters.sector) {
      where.sector = filters.sector as Sector; 
    }
  
    const orders = await this.serviceOrderRepository.find({ where });
  
    if (!orders) {
      throw new InternalServerErrorException();
    }
  
    const ordersList = orders.map(
      (serviceOrder) =>
        new ListServiceOrderDto(
          serviceOrder.id,
          serviceOrder.title,
          serviceOrder.clientRelated,
          serviceOrder.status,
          serviceOrder.sector,
          {
            id: serviceOrder.user.id,
            name: serviceOrder.user.name,
            email: serviceOrder.user.email,
          },
        ),
    );
  
    return ordersList;
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
