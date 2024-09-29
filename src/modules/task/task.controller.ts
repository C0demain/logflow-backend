import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/modules/auth/authentication.guard';
import { Sector } from 'src/modules/service-order/enums/sector.enum';
import { parseToGetTaskDTO } from 'src/modules/task/dto/get-task.dto';

@Controller('/api/v1/task')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard)
@ApiTags('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({summary: 'Criar tarefa'})
  async create(@Body() createTaskDto: CreateTaskDto) {
    const task = await this.taskService.create(createTaskDto)
    return {
      message: 'Tarefa criada com sucesso',
      task
    }
  }

  @Get()
  @ApiOperation({summary: 'Listar todas as tarefas'})
  @ApiQuery({name: 'title', required: false})
  @ApiQuery({name: 'completed', required: false})
  @ApiQuery({name: 'sector', required: false})
  @ApiQuery({name: 'assignedUserId', required: false})
  @ApiQuery({name: 'serviceOrderId', required: false})
  async findAll(@Query('title') title?: string, @Query('assignedUserId') assignedUserId?: string, @Query('serviceOrderId') serviceOrderId?: string, @Query('completed') completed?: boolean, @Query('sector') sector?: Sector) {
    const tasks = await this.taskService.findAll({ title, assignedUserId, serviceOrderId, completed, sector });
    return {
      message: 'Tarefas obtidas com sucesso',
      tasks
    }
  }

  @Get(':id')
  @ApiOperation({summary: 'Retornar uma tarefa de acordo com id'})
  async findById(@Param('id') id: string) {
    const task = await this.taskService.findById(id)
    return {
      message: 'Tarefa obtida com sucesso',
      task
    }
      
  }

  @Put(':id')
  @ApiOperation({summary: 'Atualizar uma tarefa'})
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    const task = await this.taskService.update(id, updateTaskDto)
    return {
      message: 'Tarefa atualizada com sucesso',
      task
    }
  }

  @Delete(':id')
  @ApiOperation({summary: 'Deletar uma tarefa'})
  async remove(@Param('id') id: string) {
    const task = await this.taskService.remove(id)
    return {
      message: 'Tarefa excluída com sucesso',
      task
    }
  }
}
