import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import 'dotenv/config';
import { calendar_v3, google } from 'googleapis';
import { Repository } from 'typeorm';
import { ServiceOrder } from '../service-order/entities/service-order.entity';
import { Task } from '../task/entities/task.entity';
import { CreateEventDTO } from './dto/create-event.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(ServiceOrder)
    readonly serviceOrderRepository: Repository<ServiceOrder>,
    @InjectRepository(Task)
    readonly taskRepository: Repository<Task>,
  ) {}

  client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
  );

  async getEvents() {
    this.client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
    const calendar = google.calendar({ version: 'v3', auth: this.client });
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = res.data.items;
    if (!events || events.length === 0) {
      console.log('No upcoming events found.');
      return;
    }
    console.log('Upcoming 10 events:');
    const eventsList = events.map((event, i) => {
      const start = event.start
        ? event.start.dateTime || event.start.date
        : 'No start time';
      return `${start} - ${event.summary}`;
    });
    return eventsList;
  }

  async addEvent(body: CreateEventDTO){
    console.log(body);
    this.client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

    const calendar = google.calendar({ version: 'v3', auth: this.client });

    const event: calendar_v3.Schema$Event = {
      summary: body.title,
      description: body.description,
      start: {
        dateTime: body.start,
      },
      end: {
        dateTime: body.end,
      },
    };

    calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
  }

  async addTaskAsEvent(taskId: string) {
    const task = await this.taskRepository.findOneBy({ id: taskId });
    if (!task) {
      throw new NotFoundException(`Task com id ${taskId} não encontrada.`);
    }
    this.client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

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
}
