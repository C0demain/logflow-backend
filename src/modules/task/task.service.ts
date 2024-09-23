import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/modules/task/entities/task.entity';
import { Repository } from 'typeorm'
import { NotFoundError } from 'rxjs';
import { ServiceOrderService } from 'src/modules/service-order/service-order.service';

@Injectable()
export class TaskService {

  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    private readonly serviceOrderService: ServiceOrderService
  ){}

  async create(createTaskDto: CreateTaskDto) {
    const taskDb = new Task()

    const serviceOrder = await this.serviceOrderService.findById(createTaskDto.orderId)

    if(serviceOrder === null){
      throw new NotFoundException('Ordem de serviço não encontrada')
    }

    taskDb.title = createTaskDto.title
    taskDb.serviceOrder = serviceOrder

    return await this.taskRepository.save(taskDb)
  }

  async findAll() {
    return await this.taskRepository.find()
  }

  async findById(id: string) {
    const task = await this.taskRepository.findOneBy({ id })

    if(task === null){
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`)
    }

    return task
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.taskRepository.findOneBy({ id })

    if(task === null){
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`)
    }

    Object.assign(task, updateTaskDto as Task)

    return await this.taskRepository.save(task)
  }

  async remove(id: string) {
    const task = await this.taskRepository.findOneBy({ id })

    if(task === null){
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`)
    }

    await this.taskRepository.delete(id)

    return task
  }
}
