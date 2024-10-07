import { ApiTags } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sector } from '../enums/sector.enum';
import { ServiceOrder } from './service-order.entity';
import { Exclude } from 'class-transformer';

@ApiTags('service-order-log')
@Entity({ name: 'service-order-log' })
export class ServiceOrderLog {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @ManyToOne(
    () => ServiceOrder,
    (serviceOrder) => serviceOrder.serviceOrderLogs,
    { eager: true },
  )
  @Exclude()
  serviceOrder: ServiceOrder;

  @Column({ name: 'changedTo', enum: Sector, nullable: false })
  changedTo: Sector;

  @CreateDateColumn({ name: 'creationDate', type: 'timestamp' })
  creationDate: Date;
}
