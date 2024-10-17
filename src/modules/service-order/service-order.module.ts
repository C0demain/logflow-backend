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

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceOrder,Task,RoleEntity]),
    UserModule,
    ClientModule,
    forwardRef(() => TaskModule)
  ],
  controllers: [ServiceOrderController],
  providers: [ServiceOrderService],
  exports: [ServiceOrderService]
})
export class ServiceOrderModule {}
