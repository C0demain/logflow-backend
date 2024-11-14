import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
  } from 'typeorm';
  import { ApiTags } from '@nestjs/swagger';
  
  @ApiTags('vehicles')
  @Entity({ name: 'vehicles' })
  export class Vehicle {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ name: 'plate', length: 10, nullable: false, unique: true })
    plate: string;
  
    @Column({ name: 'model', length: 50, nullable: false })
    model: string;
  
    @Column({ name: 'brand', length: 50, nullable: false })
    brand: string;
  
    @Column({ name: 'year', type: 'int', nullable: false })
    year: number;
  
    @Column({ name: 'autonomy', type: 'float', nullable: false })
    autonomy: number;
  
    @Column({ name: 'status', length: 20, nullable: false })
    status: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  }
  