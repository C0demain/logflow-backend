import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/modules/auth/authentication.guard';
import { Sector } from 'src/modules/service-order/enums/sector.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';
import { AssignUserDto } from './dto/assign-user.dto';
import { TaskStage } from './enums/task.stage.enum';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { CreateTemplateTaskDto } from 'src/modules/task/dto/create-template-task.dto';

@Controller('/api/v1/task')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard)
@ApiTags('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  @ApiOperation({ summary: 'Criar tarefa' })
  @ApiQuery({ name: 'title', required: true })
  @ApiQuery({ name: 'orderId', required: true })
  @ApiQuery({ name: 'sector', required: true })
  @ApiQuery({ name: 'stage', required: true })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'completed', required: false })
  async create(@Body() createTaskDto: CreateTaskDto) {
    const task = await this.taskService.create(createTaskDto)
    return {
      message: 'Tarefa criada com sucesso.',
      task
    }
  }

  @ApiOperation({ summary: 'Criar tarefa relacionada a processo' })
  @Post('template')
  async createTemplate(@Body() createTemplateDto: CreateTemplateTaskDto){
    const task = await this.taskService.createTemplateTask(createTemplateDto)
    return {
      message: 'Tarefa template criada com sucesso',
      task
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as tarefas' })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'assignedUserId', required: false })
  @ApiQuery({ name: 'serviceOrderId', required: false })
  @ApiQuery({ name: 'sector', required: false })
  @ApiQuery({ name: 'stage', required: false })
  @ApiQuery({ name: 'completedFrom', required: false })
  @ApiQuery({ name: 'completedTo', required: false })
  @ApiQuery({ name: 'startedFrom', required: false })
  @ApiQuery({ name: 'startedTo', required: false })
  async findAll(
    @Query('title') title?: string,
    @Query('assignedUserId') assignedUserId?: string,
    @Query('serviceOrderId') serviceOrderId?: string,
    @Query('sector') sector?: Sector,
    @Query('stage') stage?: TaskStage,
    @Query('completedFrom') completedFrom?: Date,
    @Query('completedTo') completedTo?: Date,
    @Query('startedFrom') startedFrom?: Date,
    @Query('startedTo') startedTo?: Date,
  ) {
    const tasks = await this.taskService.findAll({ title, assignedUserId, serviceOrderId, sector, stage, completedFrom, completedTo, startedFrom, startedTo });
    return {
      message: 'Tarefas obtidas com sucesso.',
      tasks
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retornar uma tarefa de acordo com id' })
  async findById(@Param('id') id: string) {
    const task = await this.taskService.findById(id)
    return {
      message: 'Tarefa obtida com sucesso.',
      task
    }

  }

  @Get('overdue/count')
  @ApiOperation({ summary: 'Listar as tarefas com atraso através de filtros de setor e período' })
  @ApiQuery({ name: 'startedAt', required: false })
  @ApiQuery({ name: 'dueDate', required: false })
  @ApiQuery({ name: 'sector', required: false })
  async getOverdueTasksCount(@Query() filters: FilterTasksDto): Promise<{ count: number }> {
    const count = await this.taskService.countOverdueTasks(filters);

    return { count };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma tarefa' })
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    const task = await this.taskService.update(id, updateTaskDto)
    return {
      message: 'Tarefa atualizada com sucesso.',
      task
    }
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Iniciar uma tarefa' })
  async start(@Param('id') id: string) {
    const task = await this.taskService.start(id)
    return {
      message: 'Tarefa iniciada com sucesso',
      task
    }
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Concluir uma tarefa' })
  async complete(@Param('id') id: string) {
    const task = await this.taskService.complete(id)
    return {
      message: 'Tarefa concluída com sucesso',
      task
    }
  }

  @Patch(':id/uncomplete')
  @ApiOperation({ summary: 'Desfazer a conclusão de uma tarefa' })
  async uncomplete(@Param('id') id: string) {
    const task = await this.taskService.uncomplete(id)
    return {
      message: 'Conclusão da tarefa desfeita com sucesso',
      task
    }
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Atribuir um usuário a uma tarefa' })
  async assign(@Param('id') id: string, @Body() userId: AssignUserDto) {
    const task = await this.taskService.assign(id, userId)
    return {
      message: 'Usuário atribuído com sucesso',
      task
    }
  }

  @Patch(':id/unassign')
  @ApiOperation({ summary: 'Desatribuir um usuário de uma tarefa' })
  async unassign(@Param('id') id: string) {
    const task = await this.taskService.unassign(id)
    return {
      message: 'Usuário desatribuído com sucesso',
      task
    }
  }

  @Patch(':id/cost')
  @ApiOperation({ summary: 'adicionar custo a uma tarefa ja existente' })
  async addCost(@Param('id') id: string, @Body('value') value: number) {
    const task = await this.taskService.addCost(id, value);
    return {
      message: 'valor atribuido a tarefa',
      task
    }
  }

  @Patch(':id/dueDate')
  @ApiOperation({ summary: 'adicionar data de previsão a uma tarefa ja existente' })
  async dueDate(@Param('id') id: string, @Body('date') date: string) {
    const parsedDueDate = this.parseBrazilianDate(date);
    if (!parsedDueDate) {
      throw new BadRequestException('Data inválida. Use o formato DD/MM/YYYY.');
    }
    const task = await this.taskService.updateDueDate(id, parsedDueDate);
    return {
      message: 'valor atribuido a tarefa',
      task
    }
  }

  @Patch(':id/assign-vehicle')
  @ApiOperation({ summary: 'Associar veículo a uma tarefa e atualizar status do veículo para "em uso"' })
  async assignVehicleToTask(
    @Param('id') taskId: string,
    @Body('vehicleId') vehicleId: string,
  ) {
    const task = await this.taskService.assignVehicleToTask(taskId, vehicleId);
    return {
      message: 'Veículo associado à tarefa com sucesso.',
      task,
    };
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Deletar uma tarefa' })
  async remove(@Param('id') id: string) {
    const task = await this.taskService.remove(id)
    return {
      message: 'Tarefa excluída com sucesso.',
      task
    }
  }

  parseBrazilianDate(dateStr: string): Date | null {
    const [day, month, year] = dateStr.split('/').map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  }
}
