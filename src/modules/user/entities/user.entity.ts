import { ApiTags } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { FileEntity } from 'src/modules/file/entities/file.entity';
import { RoleEntity } from 'src/modules/roles/roles.entity';
import { ServiceOrder } from 'src/modules/service-order/entities/service-order.entity';
import { Sector } from 'src/modules/service-order/enums/sector.enum';
import { Task } from 'src/modules/task/entities/task.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';

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

  @ManyToOne(() => RoleEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @OneToMany(() => ServiceOrder, (serviceOrder) => serviceOrder.user, {
    eager: false,
  })
  orders: ServiceOrder[];

  @Column({ name: 'sector', type: 'enum', enum: Sector, nullable: false })
  sector: Sector;

  @OneToMany(() => Task, (task) => task.assignedUser)
  tasks: Task[];

  @OneToMany(() => FileEntity, (file) => file.user)
  files: FileEntity[];

  @Column({name: 'refresh_token', type: 'text', nullable: true})
  refreshToken?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'deactivated_at', type: 'timestamptz', nullable: true, default: null })
  deactivatedAt: Date | null;
}
