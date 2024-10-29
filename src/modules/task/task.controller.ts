import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/modules/auth/authentication.guard';
import { Sector } from 'src/modules/service-order/enums/sector.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';
import { AssignUserDto } from './dto/assign-user.dto';

@Controller('/api/v1/task')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard)
@ApiTags('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({summary: 'Criar tarefa'})
  @ApiQuery({ name: 'title', required: true })
  @ApiQuery({ name: 'orderId', required: true })
  @ApiQuery({ name: 'sector', required: true})
  @ApiQuery({ name: 'stage', required: true })
  @ApiQuery({ name: 'role', required: false})
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'completed', required: false })
  async create(@Body() createTaskDto: CreateTaskDto) {
    const task = await this.taskService.create(createTaskDto)
    return {
      message: 'Tarefa criada com sucesso.',
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
  async findAll(
    @Query('title') title?: string,
    @Query('assignedUserId') assignedUserId?: string,
    @Query('serviceOrderId') serviceOrderId?: string,
    @Query('completed') completedAt?: Date,
    @Query('sector') sector?: Sector
  ) {
    const tasks = await this.taskService.findAll({ title, assignedUserId, serviceOrderId, completedAt, sector });
    return {
      message: 'Tarefas obtidas com sucesso.',
      tasks
    }
  }

  @Get(':id')
  @ApiOperation({summary: 'Retornar uma tarefa de acordo com id'})
  async findById(@Param('id') id: string) {
    const task = await this.taskService.findById(id)
    return {
      message: 'Tarefa obtida com sucesso.',
      task
    }
      
  }

  @Put(':id')
  @ApiOperation({summary: 'Atualizar uma tarefa'})
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    const task = await this.taskService.update(id, updateTaskDto)
    return {
      message: 'Tarefa atualizada com sucesso.',
      task
    }
  }

  @Patch(':id/start')
  @ApiOperation({summary: 'Iniciar uma tarefa'})
  async start(@Param('id') id: string) {
    const task = await this.taskService.start(id)
    return {
      message: 'Tarefa iniciada com sucesso',
      task
    }
  }

  @Patch(':id/complete')
  @ApiOperation({summary: 'Concluir uma tarefa'})
  async complete(@Param('id') id: string) {
    const task = await this.taskService.complete(id)
    return {
      message: 'Data de conclusão da tarefa alterada com sucesso',
      task
    }
  }

  @Patch(':id/assign')
  @ApiOperation({summary: 'Atribuir um usuário a uma tarefa'})
  async assign(@Param('id') id: string, @Body() userId: AssignUserDto) {
    const task = await this.taskService.assign(id, userId)
    return {
      message: 'Usuário atribuído com sucesso',
      task
    }
  }

  @Patch(':id/unassign')
  @ApiOperation({summary: 'Desatribuir um usuário de uma tarefa'})
  async unassign(@Param('id') id: string) {
    const task = await this.taskService.unassign(id)
    return {
      message: 'Usuário desatribuído com sucesso',
      task
    }
  }

  @Delete(':id')
  @ApiOperation({summary: 'Deletar uma tarefa'})
  async remove(@Param('id') id: string) {
    const task = await this.taskService.remove(id)
    return {
      message: 'Tarefa excluída com sucesso.',
      task
    }
  }
}
