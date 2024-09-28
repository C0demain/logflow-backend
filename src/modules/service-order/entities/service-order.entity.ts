import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Status } from '../enums/status.enum';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Sector } from '../enums/sector.enum';
import { ApiTags } from '@nestjs/swagger';
import { Client } from 'src/modules/client/entities/client.entity';
import { Task } from 'src/modules/task/entities/task.entity';

@ApiTags('service-order')
@Entity({ name: 'service-order' })
export class ServiceOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', length: 50, nullable: false })
  title: string;

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

  @CreateDateColumn({ name: 'creationDate', type: 'date' })
  creationDate: Date;

  @Column({ name: 'isActive', default: true, nullable: false })
  isActive: boolean;
}
