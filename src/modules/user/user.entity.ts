import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiTags } from '@nestjs/swagger';
import { ServiceOrder } from '../service-order/entities/service-order.entity';

import { Role } from '../roles/enums/roles.enum';
import { Sector } from '../service-order/enums/sector.enum';
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

  @OneToMany(() => ServiceOrder, (serviceOrder) => serviceOrder.user, {eager: false})
  orders: ServiceOrder[];

  @Column({ name: 'sector', type: 'enum', enum: Sector})
  sector: Sector;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: string;
}
