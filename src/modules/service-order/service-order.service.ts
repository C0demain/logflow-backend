import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import {
  Between,
  FindOptionsWhere,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
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
import { Process } from 'src/modules/process/entities/process.entity';
import { TaskService } from 'src/modules/task/task.service';
import { ProcessService } from 'src/modules/process/process.service';

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
    private readonly processService: ProcessService,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
  ) {}

  async create(
    createServiceOrderDto: CreateServiceOrderDto,
  ): Promise<ServiceOrder> {
    const serviceDb = new ServiceOrder();

    const user = await this.userService.findById(createServiceOrderDto.userId);
    const client = await this.clientService.findById(
      createServiceOrderDto.clientId,
    );
    const process = await this.processService.findById(
      createServiceOrderDto.processId,
    );

    serviceDb.title = createServiceOrderDto.title;
    serviceDb.client = client;
    serviceDb.status = createServiceOrderDto.status;
    serviceDb.sector = createServiceOrderDto.sector;
    serviceDb.user = user;

    // Opcionais
    serviceDb.description = createServiceOrderDto.description;
    serviceDb.value = createServiceOrderDto.value;

    const savedServiceOrder = await this.serviceOrderRepository.save(serviceDb);

    await this.createTasksForServiceOrder(savedServiceOrder, process);

    return savedServiceOrder;
  }

  private async createTasksForServiceOrder(
    serviceOrder: ServiceOrder,
    process: Process,
  ) {
    process.tasks.forEach(async (t) => {
      const newTask = this.taskRepository.create({
        title: t.title,
        sector: t.sector,
        role: t.role,
        serviceOrder,
        stage: t.stage,
        files: t.files,
        address: t.address,
      });

      await this.taskRepository.save(newTask);
    });
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

    if (filters.active === undefined) {
      where.deactivatedAt = IsNull();
    } else {
      where.deactivatedAt = filters.active ? IsNull() : Not(IsNull());
    }

    const orders = await this.serviceOrderRepository.find({
      where,
    });

    if (!orders || orders.length === 0) {
      return [];
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

    return logs.map((log) => ({
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

    orderFound.deactivatedAt = new Date();
    await this.serviceOrderRepository.save(orderFound);

    return orderFound;
  }

  async calculateValues(filters: {
    id?: string;
    title?: string;
    status?: string;
    sector?: string;
    active?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: FindOptionsWhere<ServiceOrder> = {};

    if (filters.id) where.id = filters.id;
    if (filters.title) where.title = filters.title;
    if (filters.status) where.status = filters.status as Status;
    if (filters.sector) where.sector = filters.sector as Sector;
    if (filters.dateFrom && filters.dateTo) {
      where.creationDate = Between(filters.dateFrom, filters.dateTo);
    } else if (filters.dateFrom) {
      where.creationDate = MoreThanOrEqual(filters.dateFrom);
    } else if (filters.dateTo) {
      where.creationDate = LessThanOrEqual(filters.dateTo);
    }

    if (filters.active === undefined) {
      where.deactivatedAt = IsNull();
    } else {
      where.deactivatedAt = filters.active ? IsNull() : Not(IsNull());
    }

    const orders = await this.serviceOrderRepository.find({
      where,
      relations: ['tasks'],
    });

    if (!orders || orders.length === 0) {
      return {
        totalValue: 0,
        averageValue: 0,
        totalTaskCost: 0,
        profit: 0,
      };
    }

    const totalValue = orders.reduce(
      (sum, order) => sum + Number(order.value || 0),
      0,
    );
    const averageValue = orders.length > 0 ? totalValue / orders.length : 0;
    const totalTaskCost = orders.reduce((sum, order) => {
      return (
        sum +
        order.tasks.reduce(
          (taskSum, task) => taskSum + Number(task.taskCost || 0),
          0,
        )
      );
    }, 0);
    const profit = totalValue - totalTaskCost;

    return {
      totalValue: totalValue.toFixed(2),
      averageValue: averageValue.toFixed(2),
      totalTaskCost: totalTaskCost.toFixed(2),
      profit: profit.toFixed(2),
    };
  }

  async calculateMonthlyValues(filters: {
    id?: string;
    title?: string;
    status?: string;
    sector?: string;
    active?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: FindOptionsWhere<ServiceOrder> = {};

    if (filters.id) where.id = filters.id;
    if (filters.title) where.title = filters.title;
    if (filters.status) where.status = filters.status as Status;
    if (filters.sector) where.sector = filters.sector as Sector;
    if (filters.dateFrom && filters.dateTo) {
      where.creationDate = Between(filters.dateFrom, filters.dateTo);
    } else if (filters.dateFrom) {
      where.creationDate = MoreThanOrEqual(filters.dateFrom);
    } else if (filters.dateTo) {
      where.creationDate = LessThanOrEqual(filters.dateTo);
    }

    if (filters.active === undefined) {
      where.deactivatedAt = IsNull();
    } else {
      where.deactivatedAt = filters.active ? IsNull() : Not(IsNull());
    }

    const orders = await this.serviceOrderRepository.find({
      where,
      relations: ['tasks'],
    });

    const dateFrom = filters.dateFrom
      ? new Date(filters.dateFrom)
      : new Date(Math.min(...orders.map((o) => +new Date(o.creationDate))));
    const dateTo = filters.dateTo
      ? new Date(filters.dateTo)
      : new Date(Math.max(...orders.map((o) => +new Date(o.creationDate))));

    const allMonths = [];
    const current = new Date(dateFrom);
    while (current <= dateTo) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1; // getMonth() retorna 0-11
      allMonths.push(`${year}-${month}`);
      current.setMonth(current.getMonth() + 1);
    }

    const monthlyData = orders.reduce(
      (acc, order) => {
        const creationDate = new Date(order.creationDate);
        const month = creationDate.getMonth() + 1;
        const year = creationDate.getFullYear();
        const key = `${year}-${month}`;

        if (!acc[key]) {
          acc[key] = {
            totalValue: 0,
            totalTaskCost: 0,
            ordersCount: 0,
            completedTasks: 0,
            completedOrders: 0,
          };
        }

        acc[key].totalValue += Number(order.value || 0);
        acc[key].totalTaskCost += order.tasks.reduce(
          (taskSum, task) => taskSum + Number(task.taskCost || 0),
          0,
        );
        acc[key].ordersCount += 1;

        // Contando tarefas concluídas no período
        const completedTasks = order.tasks.filter(
          (task) =>
            task.completedAt &&
            (!filters.dateFrom || task.completedAt >= filters.dateFrom) &&
            (!filters.dateTo || task.completedAt <= filters.dateTo),
        ).length;

        acc[key].completedTasks += completedTasks;

        if (order.status === Status.FINALIZADO) {
          acc[key].completedOrders += 1;
        }

        return acc;
      },
      {} as Record<
        string,
        {
          totalValue: number;
          totalTaskCost: number;
          ordersCount: number;
          completedTasks: number;
          completedOrders: number;
        }
      >,
    );

    // Preencher meses ausentes com valores zerados
    const result = allMonths.map((month) => {
      const data = monthlyData[month] || {
        totalValue: 0,
        totalTaskCost: 0,
        ordersCount: 0,
        completedTasks: 0,
        completedOrders: 0,
      };

      return {
        month,
        totalValue: data.totalValue.toFixed(2),
        averageValue: data.ordersCount
          ? (data.totalValue / data.ordersCount).toFixed(2)
          : '0.00',
        totalTaskCost: data.totalTaskCost.toFixed(2),
        profit: (data.totalValue - data.totalTaskCost).toFixed(2),
        completedTasks: data.completedTasks,
        completedOrders: data.completedOrders,
      };
    });

    return result;
  }
}
