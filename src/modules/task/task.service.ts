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
    private readonly userService: UserService
  ){}

  async create(createTaskDto: CreateTaskDto) {
    const taskDb = new Task()

    const serviceOrder = await this.serviceOrderService.findById(createTaskDto.orderId)

    if(serviceOrder === null){
      throw new NotFoundException('Ordem de serviço não encontrada')
    }

    const user = await this.userService.findById(createTaskDto.userId)

    if(user === null){
      throw new NotFoundException('Usuário não encontrado')
    }

    taskDb.title = createTaskDto.title
    taskDb.sector = createTaskDto.sector
    taskDb.serviceOrder = serviceOrder
    taskDb.assignedUser = user
    taskDb.produto_coletado = createTaskDto.driverChecklists.produto_coletado
    taskDb.saida_para_entrega = createTaskDto.driverChecklists.saida_para_entrega
    taskDb.chegada_do_produto = createTaskDto.driverChecklists.chegada_do_produto
    taskDb.coleta_de_assinatura = createTaskDto.driverChecklists.coleta_de_assinatura

    const createdTask =  await this.taskRepository.save(taskDb)
    return parseToGetTaskDTO(createdTask)
  }

  async findAll(filters: {title?: string, assignedUserId?: string, serviceOrderId?: string, completed?: boolean, sector?: Sector}) {
    // Construir a consulta dinamicamente
    const where: FindOptionsWhere<Task> = {}

    if(filters.title){
      where.title = filters.title
    }
    
    if(filters.completed){
      where.completed = filters.completed 
    }

    if(filters.sector){
      where.sector = filters.sector
    }

    if(filters.assignedUserId){
      where.assignedUser = {id: filters.assignedUserId}
    }

    if(filters.serviceOrderId){
      where.serviceOrder = {id: filters.serviceOrderId}
    }

    
    const tasks = await this.taskRepository.find({ where })
    
    const taskList = tasks.map( task => {
      const parsedTask = parseToGetTaskDTO(task)
      return parsedTask
    })

    return taskList
    
  }

  async findById(id: string) {
    const task = await this.taskRepository.findOneBy({ id })

    if(task === null){
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`)
    }

    const parsedTask = parseToGetTaskDTO(task)
    return parsedTask
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.taskRepository.findOneBy({ id })
    if(task === null){
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`)
    }

    const user = await this.userService.findById(updateTaskDto.userId)
    if(user === null){
      throw new NotFoundException(`Usuário com id ${id} não encontrado`)
    }

    task.title = updateTaskDto.title
    task.completed = updateTaskDto.completed
    task.assignedUser = user

    const updatedTask = await this.taskRepository.save(task)
    const parsedTask = parseToGetTaskDTO(updatedTask)

    return parsedTask
  }

  async remove(id: string) {
    const task = await this.taskRepository.findOneBy({ id })

    if(task === null){
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`)
    }

    await this.taskRepository.delete(id)
    const parsedTask = parseToGetTaskDTO(task)
    return parsedTask
  }
}
