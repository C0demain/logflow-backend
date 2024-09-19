import {
    Entity,
    Column,
    CreateDateColumn,
    PrimaryGeneratedColumn,
    ManyToOne,
} from "typeorm";
import { Status } from "../enums/status.enum";
import { UserEntity } from "src/modules/user/user.entity";

@Entity({name: 'service-order'})
export class ServiceOrder {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({name: 'title', length: 50, nullable:false})
    title: string;
  
    @Column({name: 'clientRelated', length: 50, nullable:false})
    clientRelated: string

    @ManyToOne(() => UserEntity, (user) => user.orders, {eager:true})
    user: UserEntity;
    
    @CreateDateColumn({ name: 'creationDate', type:'date'})
    creationDate: Date;

    @Column({name: 'status', type: 'enum', enum: Status, default: Status.PENDENTE})
    status: Status;
}
