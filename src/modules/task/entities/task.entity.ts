import { ServiceOrder } from "src/modules/service-order/entities/service-order.entity";
import { Sector } from "src/modules/service-order/enums/sector.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
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

    @Column({default: false})
    completed: boolean

    @Column({ name: 'sector', type: 'enum', enum: Sector, nullable: false})
    sector: Sector

    @ManyToOne(() => ServiceOrder, serviceOrder => serviceOrder.tasks, {eager:true})
    serviceOrder: ServiceOrder

    @ManyToOne(() => UserEntity, user => user.tasks, {eager:true})
    assignedUser: UserEntity

    @Column({ length: 30, nullable: true })
    produto_coletado: string

    @Column({ length: 30, nullable: true })
    saida_para_entrega: string

    @Column({ length: 30, nullable: true })
    chegada_do_produto: string

    @Column({ length: 30, nullable: true })
    coleta_de_assinatura: string
}
