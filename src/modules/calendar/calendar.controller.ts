import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from '../auth/authentication.guard';
import { CalendarService } from './calendar.service';
import { IsUUID } from 'class-validator';
import { CreateEventDTO } from './dto/create-event.dto';

@ApiTags('calendar')
@Controller('api/v1/calendar')
// @ApiBearerAuth()
// @UseGuards(AuthenticationGuard)
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get()
  @ApiOperation({
    summary: 'Buscar eventos',
    description: 'Rota acessível apenas para usuários autenticados',
  })
  async getEvents() {
    const events = await this.calendarService.getEvents();
    return {
      message: 'Eventos encontrados.',
      calendar: events,
    };
  }
  
  @Post()
  @ApiOperation({
    summary: 'Adicionar evento',
    description: 'Rota acessível apenas para usuários autenticados',
  })
  async addEvent(@Body() body: CreateEventDTO) {
    const response = await this.calendarService.addEvent(body);
    return {
      message: 'Evento adicionado com sucesso.',
      event: response,
    };
  }

  @Post('/:taskId')
  @ApiOperation({
    summary: 'Adicionar evento',
    description: 'Rota acessível apenas para usuários autenticados',
  })
  async addTaskAsEvent(@Param('taskId') taskId: string) {
    const response = await this.calendarService.addTaskAsEvent(taskId);
    return {
      message: 'Evento adicionado com sucesso.',
      event: response,
    };
  }
}
