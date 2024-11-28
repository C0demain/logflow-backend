import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
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
  async getEvents(@Body() { userId }: { userId: string }) {
    const events = await this.calendarService.getEvents(userId);
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

  @Post('/task/:taskId')
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

  @Post('/callback')
  @ApiOperation({
    summary: 'Callback de autenticação do Google',
    description: 'Rota acessível apenas para usuários autenticados',
  })
  async handleOAuthCallback(
    @Body() { code, id }: { code: string; id: string },
  ) {
    const accessToken = await this.calendarService.handleOAuthCallback(code, id);
    return {
      message: 'Refresh token salvo com sucesso.',
      accessToken,
    };
  }
}
