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

@Injectable()
export class TaskService {

  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    private readonly serviceOrderService: ServiceOrderService,
    private readonly userService: UserService,
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

    // Obrigatórios
    taskDb.title = createTaskDto.title;
    taskDb.serviceOrder = serviceOrder;
    taskDb.sector = createTaskDto.sector;
    
    // Opcionais
    taskDb.assignedUser = userId;
    taskDb.role = userId.role;
    taskDb.completed = createTaskDto.completed;

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
      throw new NotFoundException(`Tarefa com id ${id} não encontrada.`);
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

    task.title = updateTaskDto.title;
    task.serviceOrder = serviceOrder;

    // Atualizando os campos opcionais
    if (user) {
      task.assignedUser = user;
    }

    if (updateTaskDto.completed !== undefined) {
      task.completed = updateTaskDto.completed;
    }

    if (updateTaskDto.address) {
      task.address = updateTaskDto.address; 
    }

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
