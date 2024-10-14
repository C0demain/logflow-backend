import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/modules/task/entities/task.entity';
import { ServiceOrderModule } from 'src/modules/service-order/service-order.module';
import { UserModule } from 'src/modules/user/user.module';
import { ClientModule } from '../client/client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    ServiceOrderModule,
    UserModule,
    ClientModule
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
