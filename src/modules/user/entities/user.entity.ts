import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiTags } from '@nestjs/swagger';
import { Task } from 'src/modules/task/entities/task.entity';
import { ServiceOrder } from 'src/modules/service-order/entities/service-order.entity';
import { Sector } from 'src/modules/service-order/enums/sector.enum';
import { RoleEntity } from 'src/modules/roles/roles.entity';

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

  @OneToOne(() => RoleEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'role_id' })  // Define que esta coluna será a chave estrangeira
  role: RoleEntity;

  @OneToMany(() => ServiceOrder, (serviceOrder) => serviceOrder.user, {eager: false})
  orders: ServiceOrder[];

  @Column({ name: 'sector', type: 'enum', enum: Sector, nullable: false})
  sector: Sector;

  @OneToMany(() => Task, (task) => task.assignedUser)
  tasks: Task[];

  @Column({ name: 'isActive', default: true, nullable: false })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: string;

}
