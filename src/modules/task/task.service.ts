import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/modules/task/entities/task.entity';
import { Repository } from 'typeorm'
import { NotFoundError } from 'rxjs';
import { ServiceOrderService } from 'src/modules/service-order/service-order.service';
import { UserService } from 'src/modules/user/user.service';
import { GetTaskDto } from 'src/modules/task/dto/list-task.dto';

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
    taskDb.serviceOrder = serviceOrder
    taskDb.assignedUser = user

    console.log(taskDb)

    return await this.taskRepository.save(taskDb)
  }

  async findAll() {
    const tasks = await this.taskRepository.find()

    const taskList = tasks.map( task => {
      const assignedUser = task.assignedUser
      return new GetTaskDto(task.id, task.title, {
        id: assignedUser.id,
        name: assignedUser.name,
        email: assignedUser.email
      })
    })

    console.log(tasks)

    return taskList
    
  }

  async findById(id: string) {
    const task = await this.taskRepository.findOneBy({ id })

    if(task === null){
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`)
    }

    return new GetTaskDto(id, task.title, task.assignedUser)
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
    task.assignedUser = user

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
