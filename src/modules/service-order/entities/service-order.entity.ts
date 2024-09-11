import {
    Entity,
    Column,
    CreateDateColumn,
    PrimaryGeneratedColumn,
    BeforeInsert,
} from "typeorm";
import { Status } from "../enums/status.enum";

@Entity({name: 'service-order'})
export class ServiceOrder {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({name: 'title', length: 50, nullable:false})
    title: string;
  
    @Column({name: 'clientRelated', length: 50, nullable:false})
    clientRelated: string
    
    @CreateDateColumn({ name: 'creationDate', type:'date'})
    creationDate: Date;

    @Column({name : 'expirationDate', type:'date'})
    expirationDate: Date;

    @Column({name: 'status', type: 'enum', enum: Status, default: Status.PENDENTE})
    status: Status;
}
