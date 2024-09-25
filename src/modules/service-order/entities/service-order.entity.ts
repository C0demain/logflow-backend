import {
    Entity,
    Column,
    CreateDateColumn,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany
} from "typeorm";
import { Status } from "../enums/status.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Sector } from "../enums/sector.enum";
import { Task } from "src/modules/task/entities/task.entity";

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

    @Column({ name: 'sector', type: 'enum', enum: Sector, nullable: false})
    sector: Sector;

    @OneToMany( () => Task, task => task.serviceOrder)
    tasks: Task[]
}
