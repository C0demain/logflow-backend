import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrder } from '../service-order/entities/service-order.entity';
import { Task } from '../task/entities/task.entity';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { UserEntity } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, Task, ServiceOrder])],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
