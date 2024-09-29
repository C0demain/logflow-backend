import { ApiTags } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { Address } from './address.entity';
import { ServiceOrder } from 'src/modules/service-order/entities/service-order.entity';

@ApiTags('client')
@Entity({ name: 'client' })
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', length: 100, nullable: false })
  name: string;

  @Column({ name: 'telefone', length: 12, nullable: false })
  phone: string;

  @Column({ name: 'cnpj', length: 15, nullable: false })
  cnpj: string;

  @Column({ name: 'email', length: 40, nullable: false })
  email: string;

  @OneToMany(
    () => ServiceOrder,
    (serviceOrder: { client: any }) => serviceOrder.client,
  )
  serviceOrder: ServiceOrder;

  @Column(() => Address)
  address: Address;

  @Column({ name: 'isActive', default: true, nullable: false })
  isActive: boolean;
}
