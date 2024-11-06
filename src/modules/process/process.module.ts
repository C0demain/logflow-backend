import { Module } from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Process } from 'src/modules/process/entities/process.entity';
import { Task } from 'src/modules/task/entities/task.entity';
import { ServiceOrder } from 'src/modules/service-order/entities/service-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Process, Task, ServiceOrder])
  ],
  controllers: [ProcessController],
  providers: [ProcessService],
  exports: [ProcessService]
})
export class ProcessModule {}
