import { ServiceOrder } from "src/modules/service-order/entities/service-order.entity";
import { Sector } from "src/modules/service-order/enums/sector.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { TaskValidator } from "src/modules/task/validations/taskOrderValidator";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    BeforeInsert,
    BeforeUpdate,
    JoinColumn,
} from "typeorm";
import { Address } from "src/modules/client/entities/address.entity";
import { Client } from "src/modules/client/entities/client.entity";

@Entity({name: 'task'})
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({name: 'title', length: 50, nullable: false})
    title: string;

    @Column({default: false})
    completed: boolean;

    @Column({ name: 'sector', type: 'enum', enum: Sector, nullable: false})
    sector: Sector;

    @ManyToOne(() => ServiceOrder, serviceOrder => serviceOrder.tasks, {eager:true})
    serviceOrder: ServiceOrder;

    @ManyToOne(() => UserEntity, user => user.tasks, {eager:true})
    assignedUser: UserEntity;

    @ManyToOne(() => UserEntity, {eager:true})
    driver: UserEntity;

    @ManyToOne(() => Client, { eager: true })
    @JoinColumn()
    client: Client;

    @Column({ default: false, nullable: true })
    collectProduct: boolean;

    @Column({ default: false, nullable: true })
    departureForDelivery: boolean;

    @Column({ default: false, nullable: true })
    arrival: boolean;

    @Column({ default: false, nullable: true })
    collectSignature: boolean;

    // Validação dos atributos inter-relacionados: collectProduct, departureForDelivery, arrival e collectSignature
    @BeforeInsert()
    @BeforeUpdate()
    validateTaskOrder() {
       TaskValidator.validate(this);
    }
}