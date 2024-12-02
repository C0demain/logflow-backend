import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import 'dotenv/config';
import { calendar_v3, google } from 'googleapis';
import { Repository } from 'typeorm';
import { ServiceOrder } from '../service-order/entities/service-order.entity';
import { Task } from '../task/entities/task.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CreateEventDTO } from './dto/create-event.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ServiceOrder)
    private readonly serviceOrderRepository: Repository<ServiceOrder>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  private readonly client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
  );

  async getEvents(userId: string): Promise<calendar_v3.Schema$Event[]> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user || !user.refreshToken) {
      throw new NotFoundException(
        `Usuário com id ${userId} não encontrado ou não autenticado.`,
      );
    }

    this.client.setCredentials({ refresh_token: user.refreshToken });
    const calendar = google.calendar({ version: 'v3', auth: this.client });

    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = res.data.items;
    if (!events || events.length === 0) {
      return [];
    }

    return events;
  }

  async addEvent(body: CreateEventDTO) {
    const userId = body.userId;
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user || !user.refreshToken) {
      throw new NotFoundException(
        `User with id ${userId} not found or not authenticated.`,
      );
    }

    this.client.setCredentials({ refresh_token: user.refreshToken });
    const calendar = google.calendar({ version: 'v3', auth: this.client });

    const event: calendar_v3.Schema$Event = {
      summary: body.title,
      description: String(body.description) + '\n\nCriado através de Logflow',
      location: body.location,
      start: {
        dateTime: body.start,
      },
      end: {
        dateTime: body.end,
      },
    };

    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
  }

  async addTaskAsEvent(taskId: string) {
    const task = await this.taskRepository.findOneBy({ id: taskId });
    if (!task) {
      throw new NotFoundException(`Task com id ${taskId} não encontrada.`);
    }

    const calendar = google.calendar({ version: 'v3', auth: this.client });

    const event: calendar_v3.Schema$Event = {
      summary: task.title,
      colorId: '11',
      start: {
        dateTime: task.dueDate?.toISOString(),
      },
      end: {
        dateTime: task.dueDate?.toISOString(),
      },
    };

    calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return event;
  }

  async handleOAuthCallback(code: string, userId: string) {
    try {
      const { tokens } = await this.client.getToken(code);
      console.log(tokens);
      if (!tokens.refresh_token) {
        throw new Error('No refresh token received from Google.');
      }

      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found.`);
      }

      user.refreshToken = tokens.refresh_token;
      await this.userRepository.save(user);
      return tokens.access_token;
    } catch (error) {
      console.log(error);
    }
  }
}
