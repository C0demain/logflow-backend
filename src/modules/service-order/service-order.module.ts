import { Module } from '@nestjs/common';
import { ServiceOrderService } from './service-order.service';
import { ServiceOrderController } from './service-order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrder } from './entities/service-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceOrder])],
  controllers: [ServiceOrderController],
  providers: [ServiceOrderService],
  exports: [ServiceOrderService]
})
export class ServiceOrderModule {}
