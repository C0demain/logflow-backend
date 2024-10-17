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
import { ServiceOrderLog } from './entities/service-order-log.entity';
import { Task } from '../task/entities/task.entity';
import { RoleEntity } from '../roles/roles.entity';

@Injectable()
export class ServiceOrderService {
  constructor(
    @InjectRepository(ServiceOrder)
    private readonly serviceOrderRepository: Repository<ServiceOrder>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
  ) {}

  async create(createServiceOrderDto: CreateServiceOrderDto): Promise<ServiceOrder> {
    const serviceDb = new ServiceOrder();
  
    const user = await this.userService.findById(createServiceOrderDto.userId);
    const client = await this.clientService.findById(createServiceOrderDto.clientId);
  
    serviceDb.title = createServiceOrderDto.title;
    serviceDb.client = client;
    serviceDb.status = createServiceOrderDto.status;
    serviceDb.sector = createServiceOrderDto.sector;
    serviceDb.user = user;
  
    const savedServiceOrder = await this.serviceOrderRepository.save(serviceDb);
  
    await this.createTasksForServiceOrder(savedServiceOrder);
  
    return savedServiceOrder;
  }
  
  private async createTasksForServiceOrder(serviceOrder: ServiceOrder) {
    const motoristaRole = await this.roleRepository.findOne({ where: { name: 'Motorista' } });
    const financeiroRole = await this.roleRepository.findOne({ where: { name: 'Analista Administrativo "Financeiro"' } });
    const operacionalRole = await this.roleRepository.findOne({ where: { name: 'Gerente Operacional' } });
  
    if(!motoristaRole || !financeiroRole || !operacionalRole){
      throw new NotFoundException("roles nao encontradas")
    }
    const tasks = [
      this.createTask('Documentos de Coleta', Sector.OPERACIONAL, motoristaRole, serviceOrder),
      this.createTask('Endereço de Coleta', Sector.OPERACIONAL, motoristaRole, serviceOrder),
      this.createTask('Motorista: (vincular motorista)', Sector.OPERACIONAL, motoristaRole, serviceOrder),
      this.createTask('Assinatura de Coleta', Sector.OPERACIONAL, motoristaRole, serviceOrder),
      this.createTask('Trazer p/ Galpão', Sector.OPERACIONAL, operacionalRole, serviceOrder),
  
      this.createTask('Documentos de Entrega', Sector.OPERACIONAL, motoristaRole, serviceOrder),
      this.createTask('Endereço de Entrega', Sector.OPERACIONAL, motoristaRole, serviceOrder),
      this.createTask('Motorista: (vincular motorista)', Sector.OPERACIONAL, motoristaRole, serviceOrder),
      this.createTask('Assinatura de Entrega', Sector.OPERACIONAL, motoristaRole, serviceOrder),
      this.createTask('Devolução de Documentos', Sector.OPERACIONAL, operacionalRole, serviceOrder),
  
      this.createTask('Confirmação de Entrega', Sector.FINANCEIRO, financeiroRole, serviceOrder),
      this.createTask('Emissão de NF/BOLETO', Sector.FINANCEIRO, financeiroRole, serviceOrder),
      this.createTask('Confirmação de Recebimento', Sector.FINANCEIRO, financeiroRole, serviceOrder),
    ];
  
    await this.taskRepository.save(tasks);
  }
  
  private createTask(
    title: string,
    sector: Sector,
    role: RoleEntity,
    serviceOrder: ServiceOrder
  ): Task {
    const task = new Task();
    task.title = title;
    task.sector = sector;
    task.role = role;
    task.serviceOrder = serviceOrder;
    return task;
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

    const orders = await this.serviceOrderRepository.find({
      where,
      relations: {
        serviceOrderLogs: true,
      },
    });

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
          userRole: user.role.name,
        },
        serviceOrder.serviceOrderLogs.map((log) => ({
          changedTo: log.changedTo,
          atDate: log.creationDate,
        })),
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
      relations: {
        serviceOrderLogs: true,
      },
    });

    if (!orderFound) {
      throw new NotFoundException(
        `Ordem de serviço com id: ${id}, não encontrada`,
      );
    }

    if (
      newOrderData.sector != undefined &&
      orderFound.sector !== newOrderData.sector
    ) {
      const orderLog = new ServiceOrderLog();
      orderLog.changedTo = newOrderData.sector;
      orderFound.serviceOrderLogs.push(orderLog);
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
