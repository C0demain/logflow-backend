import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
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
import { TaskStage } from '../task/enums/task.stage.enum';
import { async } from 'rxjs';

@Injectable()
export class ServiceOrderService {
  constructor(
    @InjectRepository(ServiceOrder)
    private readonly serviceOrderRepository: Repository<ServiceOrder>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(ServiceOrderLog)
    private readonly logsRepository: Repository<ServiceOrderLog>,
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

    // Opcionais
    serviceDb.description = createServiceOrderDto.description;
    serviceDb.value = createServiceOrderDto.value;
  
    const savedServiceOrder = await this.serviceOrderRepository.save(serviceDb);
  
    await this.createTasksForServiceOrder(savedServiceOrder);
  
    return savedServiceOrder;
  }
  
  private async createTasksForServiceOrder(serviceOrder: ServiceOrder) {
    const motoristaRole = await this.roleRepository.findOne({ where: { name: 'Motorista' } });
    const financeiroRole = await this.roleRepository.findOne({ where: { name: 'Analista Administrativo "Financeiro"' } });
    const operacionalRole = await this.roleRepository.findOne({ where: { name: 'Gerente Operacional' } });
  
    if(!motoristaRole || !financeiroRole || !operacionalRole){
      throw new NotFoundException("Funções não encontradas.")
    }
    const tasks = [
      this.createTask('Documentos de Coleta', Sector.OPERACIONAL, TaskStage.DOCUMENTS_ISSUANCE, motoristaRole, serviceOrder),
      this.createTask('Endereço de Coleta', Sector.OPERACIONAL, TaskStage.DOCUMENTS_ISSUANCE, motoristaRole, serviceOrder),
      this.createTask('Motorista: Assinatura de Coleta', Sector.OPERACIONAL, TaskStage.COLLECTION, motoristaRole, serviceOrder),
      this.createTask('Motorista: Trazer p/ Galpão', Sector.OPERACIONAL, TaskStage.COLLECTION, operacionalRole, serviceOrder),
  
      this.createTask('Documentos de Entrega', Sector.OPERACIONAL, TaskStage.DELIVERY_DOCUMENTS_ISSUANCE, motoristaRole, serviceOrder),
      this.createTask('Endereço de Entrega', Sector.OPERACIONAL, TaskStage.DELIVERY_DOCUMENTS_ISSUANCE, motoristaRole, serviceOrder),
      this.createTask('Motorista: Assinatura de Entrega', Sector.OPERACIONAL, TaskStage.DELIVERY, motoristaRole, serviceOrder),
      this.createTask('Motorista: Devolução de Documentos', Sector.OPERACIONAL, TaskStage.DELIVERY, operacionalRole, serviceOrder),
  
      this.createTask('Confirmação de Entrega', Sector.FINANCEIRO, TaskStage.DELIVERY_CONFIRMATION, financeiroRole, serviceOrder),
      this.createTask('Emissão de NF/BOLETO', Sector.FINANCEIRO, TaskStage.BUDGET_CHECK, financeiroRole, serviceOrder),
      this.createTask('Confirmação de Recebimento', Sector.FINANCEIRO, TaskStage.SALE_COMPLETED, financeiroRole, serviceOrder),
    ];
  
    for(let t of tasks){
      await this.taskRepository.save(t)
    }
  }
  
  private createTask(
    title: string,
    sector: Sector,
    stage: TaskStage,
    role: RoleEntity,
    serviceOrder: ServiceOrder
  ): Task {
    const task = new Task();
    task.title = title;
    task.sector = sector;
    task.stage = stage;
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
    createdFrom?: Date;
    createdTo?: Date;
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

    if (filters.createdFrom && filters.createdTo) {
      where.creationDate = Between(filters.createdFrom, filters.createdTo);
    } else if (filters.createdFrom) {
      where.creationDate = MoreThanOrEqual(filters.createdFrom);
    } else if (filters.createdTo) {
      where.creationDate = LessThanOrEqual(filters.createdTo);
    }

    where.isActive = filters.active === undefined ? true : filters.active;

    const orders = await this.serviceOrderRepository.find({
      where,
    });

    if (!orders || orders.length === 0) {
      throw new InternalServerErrorException(
        'Nenhuma ordem de serviço encontrada.',
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
        serviceOrder.description,
        serviceOrder.value,
        serviceOrder.creationDate,
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
        `Ordem de serviço com id: ${id} não encontrada.`,
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
        `Ordem de serviço com id: ${id} não encontrada.`,
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

  async getLogs(filters: {
    id?: string;
    serviceOrderId?: string;
    changedTo?: Sector;
  }) {
    const where: FindOptionsWhere<ServiceOrderLog> = {};
  
    if (filters.id) {
      where.id = filters.id;
    }
  
    if (filters.serviceOrderId) {
      where.serviceOrder = { id: filters.serviceOrderId };
    }
  
    if (filters.changedTo) {
      where.changedTo = filters.changedTo;
    }
  
    const logs = await this.logsRepository.find({
      where,
      relations: ['serviceOrder'],
    });
  
    if (logs.length === 0) {
      throw new NotFoundException('Nenhum log de ordem de serviço encontrado.');
    }
  
    return logs.map(log => ({
      id: log.id,
      changedTo: log.changedTo,
      creationDate: log.creationDate,
    }));
  }
  
  async remove(id: string) {
    const orderFound = await this.serviceOrderRepository.findOne({
      where: { id },
    });

    if (!orderFound) {
      throw new NotFoundException(
        `Ordem de serviço com id: ${id} não encontrada.`,
      );
    }

    orderFound.isActive = false;
    await this.serviceOrderRepository.save(orderFound);

    return orderFound;
  }
}
