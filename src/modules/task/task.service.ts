import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/modules/task/entities/task.entity';
import {
  Repository,
  FindOptionsWhere,
  MoreThan,
  MoreThanOrEqual,
  Between,
} from 'typeorm';
import { ServiceOrderService } from 'src/modules/service-order/service-order.service';
import { UserService } from 'src/modules/user/user.service';
import { parseToGetTaskDTO } from 'src/modules/task/dto/get-task.dto';
import { Sector } from 'src/modules/service-order/enums/sector.enum';
import { TaskStage } from './enums/task.stage.enum';
import { FilterTasksDto } from './dto/filter-tasks.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    private readonly serviceOrderService: ServiceOrderService,
    private readonly userService: UserService,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const taskDb = new Task();

    const serviceOrder = await this.serviceOrderService.findById(
      createTaskDto.orderId,
    );
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
    taskDb.stage = createTaskDto.stage;

    // Opcionais
    taskDb.assignedUser = userId;
    taskDb.role = userId.role;
    taskDb.completedAt = createTaskDto.completedAt;

    const createdTask = await this.taskRepository.save(taskDb);
    return parseToGetTaskDTO(createdTask);
  }

  async findAll(filters: {
    title?: string;
    assignedUserId?: string;
    serviceOrderId?: string;
    sector?: Sector;
    stage?: TaskStage;
    completedFrom?: Date;
    completedTo?: Date;
    startedFrom?: Date;
    startedTo?: Date;
  }) {
    // Construir a consulta dinamicamente
    const where: FindOptionsWhere<Task> = {};

    if (filters.title) {
      where.title = filters.title;
    }

    if (filters.completedFrom && filters.completedTo) {
      where.completedAt = Between(filters.completedFrom, filters.completedTo);
    }

    if (filters.startedFrom && filters.startedTo) {
      where.startedAt = Between(filters.startedFrom, filters.startedTo);
    }

    if (filters.sector) {
      where.sector = filters.sector;
    }

    if (filters.assignedUserId) {
      where.assignedUser = { id: filters.assignedUserId };
    }

    if (filters.serviceOrderId) {
      where.serviceOrder = { id: filters.serviceOrderId };
    }

    if (filters.stage) {
      where.stage = filters.stage;
    }

    const tasks = await this.taskRepository.find({
      where,
      order: { createdAt: 'asc' },
    });

    const taskList = tasks.map((task) => {
      const parsedTask = parseToGetTaskDTO(task);
      return parsedTask;
    });

    return taskList;
  }

  async findById(id: string) {
    const task = await this.taskRepository.findOneBy({ id });

    if (task === null) {
      throw new NotFoundException(`Tarefa com id ${id} não encontrada.`);
    }

    const parsedTask = parseToGetTaskDTO(task);
    return parsedTask;
  }

  async countOverdueTasks(filters: FilterTasksDto): Promise<number> {
    const query = this.taskRepository.createQueryBuilder('task');

    if (filters.startedAt) {
      //Busca tarefas que estão atrasadas filtrando pela data de início
      query.andWhere(
        'task.completedAt > task.dueDate AND task.startedAt >= :startedAt',
        { startedAt: filters.startedAt },
      );
    }

    if (filters.dueDate) {
      // Busca tarefas que estão atrasadas filtrando pela data de vencimento
      query.andWhere(
        'task.completedAt > task.dueDate AND task.dueDate <= :dueDate',
        { dueDate: filters.dueDate },
      );
    }

    if (filters.sector) {
      //Busca tarefas que estão atrasadas filtrando pelo setor
      query.andWhere('task.sector = :sector', { sector: filters.sector });
    }

    const count = await query.getCount();
    return count;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    // Verifica se a tarefa existe
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Tarefa com id ${id} não encontrada.`);
    }

    // Busca a ordem de serviço (obrigatório)
    const serviceOrder = await this.serviceOrderService.findById(
      updateTaskDto.orderId,
    );
    if (!serviceOrder) {
      throw new NotFoundException('Ordem de serviço não encontrada.');
    }

    // Atualizando os campos obrigatórios
    task.title = updateTaskDto.title;
    task.serviceOrder = serviceOrder;
    task.sector = updateTaskDto.sector;
    task.stage = updateTaskDto.stage;

    // Atualizando os campos opcionais
    let user = null;
    if (updateTaskDto.userId) {
      user = await this.userService.findById(updateTaskDto.userId);
      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }
    }

    if (user) {
      task.assignedUser = user;
    }
    if (updateTaskDto.completedAt !== undefined) {
      task.completedAt = updateTaskDto.completedAt;
    }
    if (updateTaskDto.startedAt !== undefined) {
      task.startedAt = updateTaskDto.startedAt;
    }
    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = updateTaskDto.dueDate;
    }
    if (updateTaskDto.address) {
      task.address = updateTaskDto.address;
    }

    const updatedTask = await this.taskRepository.save(task);

    return parseToGetTaskDTO(updatedTask);
  }

  async start(id: string) {
    const task = await this.taskRepository.findOneBy({ id });

    if (task === null) {
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`);
    }

    task.startedAt = new Date();
    const startedTask = await this.taskRepository.save(task);
    return parseToGetTaskDTO(startedTask);
  }

  async complete(id: string) {
    const task = await this.taskRepository.findOneBy({ id });

    if (task === null) {
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`);
    }

    task.completedAt = new Date();
    const completedTask = await this.taskRepository.save(task);
    return parseToGetTaskDTO(completedTask);
  }

  async uncomplete(id: string) {
    const task = await this.taskRepository.findOneBy({ id });

    if (task === null) {
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`);
    }

    task.completedAt = null;
    const uncompletedTask = await this.taskRepository.save(task);
    return parseToGetTaskDTO(uncompletedTask);
  }

  async assign(id: string, body: { userId: string }) {
    const task = await this.taskRepository.findOneBy({ id });

    if (task === null) {
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`);
    }

    const user = await this.userService.findById(body.userId);

    if (user === null) {
      throw new NotFoundException(
        `Usuário com id ${body.userId} não encontrado`,
      );
    }

    task.assignedUser = user;
    const assignedTask = await this.taskRepository.save(task);
    return parseToGetTaskDTO(assignedTask);
  }

  async unassign(id: string) {
    const task = await this.taskRepository.findOneBy({ id });

    if (task === null) {
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`);
    }

    task.assignedUser = null;

    const unassignedTask = await this.taskRepository.save(task);
    return parseToGetTaskDTO(unassignedTask);
  }

  async addCost(id: string, cost: number) {
    const task = await this.taskRepository.findOneBy({ id });

    if (task === null) {
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`);
    }

    task.taskCost = cost;
    const updatedTask = await this.taskRepository.save(task);
    return parseToGetTaskDTO(updatedTask);
  }

  async updateDueDate(id: string, dueDate: Date) {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    task.dueDate = dueDate;
    return this.taskRepository.save(task);
  }

  async remove(id: string) {
    const task = await this.taskRepository.findOneBy({ id });

    if (task === null) {
      throw new NotFoundException(`Tarefa com id ${id} não encontrada.`);
    }

    await this.taskRepository.delete(id);
    const parsedTask = parseToGetTaskDTO(task);
    return parsedTask;
  }
}
