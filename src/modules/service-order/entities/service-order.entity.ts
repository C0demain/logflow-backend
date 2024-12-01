import { ApiTags } from '@nestjs/swagger';
import { Client } from 'src/modules/client/entities/client.entity';
import { Task } from 'src/modules/task/entities/task.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Sector } from '../enums/sector.enum';
import { Status } from '../enums/status.enum';
import { ServiceOrderLog } from './service-order-log.entity';

@ApiTags('service-order')
@Entity({ name: 'service-order' })
export class ServiceOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, nullable: false, unique: true })
  code: string;

  @ManyToOne(() => UserEntity, (user) => user.orders, { eager: true })
  user: UserEntity;

  @ManyToOne(() => Client, { eager: true })
  @JoinColumn()
  client: Client;

  @Column({
    name: 'status',
    type: 'enum',
    enum: Status,
    default: Status.PENDENTE,
  })
  status: Status;

  @Column({ name: 'sector', type: 'enum', enum: Sector, nullable: false })
  sector: Sector;

  @OneToMany(() => Task, (task) => task.serviceOrder)
  tasks: Task[];

  @OneToMany(
    () => ServiceOrderLog,
    (serviceOrderLog) => serviceOrderLog.serviceOrder,
    { cascade: true },
  )
  @JoinColumn()
  serviceOrderLogs: ServiceOrderLog[];

  @CreateDateColumn({ name: 'creationDate', type: 'date' })
  creationDate: Date;

  @Column({ name: 'deactivated_at', type: 'timestamptz', nullable: true, default: null })
  deactivatedAt: Date | null;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  value: number;
}
