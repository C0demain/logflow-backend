import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('/api/v1/task')
@ApiTags('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({summary: 'Criar tarefa'})
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({summary: 'Listar todas as tarefas'})
  @ApiQuery({name: 'title', required: false})
  @ApiQuery({name: 'assignedUserId', required: false})
  @ApiQuery({name: 'serviceOrderId', required: false})
  findAll(@Query('title') title?: string, @Query('assignedUserId') assignedUserId?: string, @Query('serviceOrderId') serviceOrderId?: string) {
    return this.taskService.findAll({ title, assignedUserId, serviceOrderId });
  }

  @Get(':id')
  @ApiOperation({summary: 'Retornar uma tarefa de acordo com id'})
  findById(@Param('id') id: string) {
    return this.taskService.findById(id);
  }

  @Put(':id')
  @ApiOperation({summary: 'Atualizar uma tarefa'})
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({summary: 'Deletar uma tarefa'})
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
