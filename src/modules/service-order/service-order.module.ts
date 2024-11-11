import { forwardRef, Module } from '@nestjs/common';
import { ServiceOrderService } from './service-order.service';
import { ServiceOrderController } from './service-order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrder } from './entities/service-order.entity';
import { UserModule } from '../user/user.module';
import { ClientModule } from '../client/client.module';
import { TaskModule } from '../task/task.module';
import { Task } from '../task/entities/task.entity';
import { RoleEntity } from '../roles/roles.entity';
import { ServiceOrderLog } from './entities/service-order-log.entity';
import { Process } from 'src/modules/process/entities/process.entity';
import { ProcessModule } from 'src/modules/process/process.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceOrder,Task,RoleEntity, Process, ServiceOrderLog]),
    UserModule,
    ClientModule,
    ProcessModule,
    forwardRef(() => TaskModule)
  ],
  controllers: [ServiceOrderController],
  providers: [ServiceOrderService],
  exports: [ServiceOrderService]
})
export class ServiceOrderModule {}
