import { ServiceOrder } from "src/modules/service-order/entities/service-order.entity";
import { UserEntity } from "src/modules/user/user.entity";
import {
    Entity,
    Column,
    CreateDateColumn,
    PrimaryGeneratedColumn,
    ManyToOne,
} from "typeorm";

@Entity({name: 'task'})
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({name: 'title', length: 50, nullable: false})
    title: string

    @ManyToOne(() => ServiceOrder, serviceOrder => serviceOrder.tasks)
    serviceOrder: ServiceOrder

    @ManyToOne(() => UserEntity, user => user.tasks, {eager:true})
    assignedUser: UserEntity

}
