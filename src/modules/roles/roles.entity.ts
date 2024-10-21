import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Sector } from 'src/modules/service-order/enums/sector.enum';

@Entity({ name: 'roles' })
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', length: 100, nullable: false, unique:true })
  name: string;

  @Column({ name: 'description', length: 255, nullable: false })
  description: string;

  @Column({ name: 'sector', type: 'enum', enum: Sector, nullable: false })
  sector: Sector;
}
