import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/modules/task/entities/task.entity';
import { Repository, FindOptionsWhere } from 'typeorm'
import { ServiceOrderService } from 'src/modules/service-order/service-order.service';
import { UserService } from 'src/modules/user/user.service';
import { parseToGetTaskDTO } from 'src/modules/task/dto/get-task.dto';
import { Sector } from 'src/modules/service-order/enums/sector.enum';
import { ClientService } from 'src/modules/client/client.service';

@Injectable()
export class TaskService {

  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    private readonly serviceOrderService: ServiceOrderService,
    private readonly userService: UserService,
    private readonly clientService: ClientService
  ) { }

  async create(createTaskDto: CreateTaskDto) {
    const taskDb = new Task();

    const serviceOrder = await this.serviceOrderService.findById(createTaskDto.orderId);
    if (serviceOrder === null) {
      throw new NotFoundException('Ordem de serviço não encontrada.');
    }

    const userId = await this.userService.findById(createTaskDto.userId);
    if (userId === null) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    let driverId = null;
    if (createTaskDto.driverId) {
      driverId = await this.userService.findById(createTaskDto.driverId);
      if (!driverId) {
        throw new NotFoundException('Motorista não encontrado.');
      }
    }

    let clientId = null;
    if (createTaskDto.clientId) {
      clientId = await this.clientService.findById(createTaskDto.clientId);
      if (!clientId) {
        throw new NotFoundException("Cliente não encontrado.");
      }
    }

    // Obrigatórios
    taskDb.title = createTaskDto.title;
    taskDb.sector = createTaskDto.sector;
    taskDb.serviceOrder = serviceOrder;

    // Opcionais
    taskDb.assignedUser = userId;
    taskDb.collectProduct = createTaskDto.collectProduct;
    taskDb.departureForDelivery = createTaskDto.departureForDelivery;
    taskDb.arrival = createTaskDto.arrival;
    taskDb.collectSignature = createTaskDto.collectSignature;

    if (driverId) {
      taskDb.driver = driverId;
    }
    if (clientId) {
      taskDb.client = clientId;
    }

    const createdTask = await this.taskRepository.save(taskDb);
    return parseToGetTaskDTO(createdTask);
  }

  async findAll(filters: { title?: string, assignedUserId?: string, serviceOrderId?: string, completed?: boolean, sector?: Sector }) {
    // Construir a consulta dinamicamente
    const where: FindOptionsWhere<Task> = {}

    if (filters.title) {
      where.title = filters.title
    }

    if (filters.completed) {
      where.completed = filters.completed
    }

    if (filters.sector) {
      where.sector = filters.sector
    }

    if (filters.assignedUserId) {
      where.assignedUser = { id: filters.assignedUserId }
    }

    if (filters.serviceOrderId) {
      where.serviceOrder = { id: filters.serviceOrderId }
    }


    const tasks = await this.taskRepository.find({ where })

    const taskList = tasks.map(task => {
      const parsedTask = parseToGetTaskDTO(task)
      return parsedTask
    })

    return taskList

  }

  async findById(id: string) {
    const task = await this.taskRepository.findOneBy({ id })

    if (task === null) {
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`)
    }

    const parsedTask = parseToGetTaskDTO(task)
    return parsedTask
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    // Verifica se a tarefa existe
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`);
    }

    // Busca a ordem de serviço (obrigatório)
    const serviceOrder = await this.serviceOrderService.findById(updateTaskDto.orderId);
    if (!serviceOrder) {
      throw new NotFoundException('Ordem de serviço não encontrada.');
    }

    // Busca o usuário atribuído (opcional)
    let user = null;
    if (updateTaskDto.userId) {
      user = await this.userService.findById(updateTaskDto.userId);
      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }
    }

    // Busca o motorista (opcional)
    let driver = null;
    if (updateTaskDto.driverId) {
      driver = await this.userService.findById(updateTaskDto.driverId);
      if (!driver) {
        throw new NotFoundException('Motorista não encontrado.');
      }
    }

    // Busca o cliente (opcional)
    let client = null;
    if (updateTaskDto.clientId) {
      client = await this.clientService.findById(updateTaskDto.clientId);
      if (!client) {
        throw new NotFoundException('Cliente não encontrado.');
      }
    }

    // Atualizando os campos obrigatórios
    task.title = updateTaskDto.title;
    task.sector = updateTaskDto.sector;
    task.serviceOrder = serviceOrder;
    task.completed = updateTaskDto.completed;

    // Atualizando os campos opcionais
    if (user) {
      task.assignedUser = user;
    }

    if (driver) {
      task.driver = driver;
    }

    if (client) {
      task.client = client;
    }

    task.collectProduct = updateTaskDto.collectProduct;
    task.departureForDelivery = updateTaskDto.departureForDelivery;
    task.arrival = updateTaskDto.arrival;
    task.collectSignature = updateTaskDto.collectSignature;

    const updatedTask = await this.taskRepository.save(task);

    return parseToGetTaskDTO(updatedTask);
  }

  async remove(id: string) {
    const task = await this.taskRepository.findOneBy({ id })

    if (task === null) {
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`)
    }

    await this.taskRepository.delete(id)
    const parsedTask = parseToGetTaskDTO(task)
    return parsedTask
  }
}
