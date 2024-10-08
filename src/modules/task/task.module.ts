import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrder } from 'src/modules/service-order/entities/service-order.entity';
import { Task } from 'src/modules/task/entities/task.entity';
import { ServiceOrderModule } from 'src/modules/service-order/service-order.module';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    ServiceOrderModule,
    UserModule
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
