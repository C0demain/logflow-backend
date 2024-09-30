import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceOrder } from './entities/service-order.entity';
import { ListServiceOrderDto } from './dto/list-service-order.dto';
import { UserService } from '../user/user.service';
import { Status } from './enums/status.enum';
import { Sector } from './enums/sector.enum';
import { ClientService } from '../client/client.service';

@Injectable()
export class ServiceOrderService {
  constructor(
    @InjectRepository(ServiceOrder)
    private readonly serviceOrderRepository: Repository<ServiceOrder>,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
  ) {}

  async create(createServiceOrderDto: CreateServiceOrderDto) {
    const serviceDb = new ServiceOrder();

    const user = await this.userService.findById(createServiceOrderDto.userId);
    const client = await this.clientService.findById(
      createServiceOrderDto.clientId,
    );

    serviceDb.title = createServiceOrderDto.title;
    serviceDb.client = client;
    serviceDb.status = createServiceOrderDto.status;
    serviceDb.sector = createServiceOrderDto.sector;
    serviceDb.user = user;

    return await this.serviceOrderRepository.save(serviceDb);
  }

  async findAll(filters: {
    id?: string;
    title?: string;
    status?: string;
    sector?: string;
    active?: boolean;
  }) {
    // Construir a consulta dinamicamente
    const where: FindOptionsWhere<ServiceOrder> = {};

    if (filters.id) {
      where.id = filters.id;
    }

    if (filters.title) {
      where.title = filters.title;
    }

    if (filters.status) {
      where.status = filters.status as Status;
    }

    if (filters.sector) {
      where.sector = filters.sector as Sector;
    }

    where.isActive = filters.active === undefined ? true : filters.active;

    const orders = await this.serviceOrderRepository.find({ where });

    if (!orders || orders.length === 0) {
      throw new InternalServerErrorException(
        'Nenhuma ordem de serviço encontrada',
      );
    }

    const ordersList = orders.map((serviceOrder) => {
      const user = serviceOrder.user;
      const client = serviceOrder.client;
      return new ListServiceOrderDto(
        serviceOrder.id,
        serviceOrder.title,
        {
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          clientCnpj: client.cnpj,
        },
        serviceOrder.status,
        serviceOrder.sector,
        {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
        },
      );
    });

    return ordersList;
  }

  async findById(id: string) {
    const orderFound = await this.serviceOrderRepository.findOne({
      where: { id },
    });

    if (!orderFound) {
      throw new NotFoundException(
        `Ordem de serviço com id: ${id}, não encontrada`,
      );
    }

    return orderFound;
  }

  async update(id: string, newOrderData: UpdateServiceOrderDto) {
    const orderFound = await this.serviceOrderRepository.findOne({
      where: { id },
    });

    if (!orderFound) {
      throw new NotFoundException(
        `Ordem de serviço com id: ${id}, não encontrada`,
      );
    }

    Object.assign(orderFound, newOrderData);

    return await this.serviceOrderRepository.save(orderFound);
  }

  async remove(id: string) {
    const orderFound = await this.serviceOrderRepository.findOne({
      where: { id },
    });

    if (!orderFound) {
      throw new NotFoundException(
        `Ordem de serviço com id: ${id}, não encontrada`,
      );
    }

    orderFound.isActive = false;
    await this.serviceOrderRepository.save(orderFound);

    return orderFound;
  }
}
