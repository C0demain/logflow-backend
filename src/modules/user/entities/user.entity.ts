import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiTags } from '@nestjs/swagger';
import { Task } from 'src/modules/task/entities/task.entity';
import { Role } from 'src/modules/roles/enums/roles.enum';
import { ServiceOrder } from 'src/modules/service-order/entities/service-order.entity';
import { Sector } from 'src/modules/service-order/enums/sector.enum';

@ApiTags('users')
@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', length: 100, nullable: false })
  name: string;

  @Column({ name: 'email', length: 70, nullable: false })
  email: string;

  @Exclude()
  @Column({ name: 'password', length: 255, nullable: false })
  password: string;

  @Column({ name: 'role', type: 'enum', enum: Role, default: Role.EMPLOYEE })
  role: Role;

  @Column({ name: 'sector', type: 'enum', enum: Sector, nullable: false })
  sector: Sector;

  @OneToMany(() => ServiceOrder, (serviceOrder) => serviceOrder.user, {
    eager: false,
  })
  orders: ServiceOrder[];

  @OneToMany(() => Task, (task) => task.assignedUser)
  tasks: Task[];

  @Column({ name: 'isActive', default: true, nullable: false })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: string;
}
