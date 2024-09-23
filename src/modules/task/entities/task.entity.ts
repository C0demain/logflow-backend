import { ServiceOrder } from "src/modules/service-order/entities/service-order.entity";
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

}
