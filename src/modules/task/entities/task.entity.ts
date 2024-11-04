import { Address } from "src/modules/client/entities/address.entity";
import { FileEntity } from "src/modules/file/entities/file.entity";
import { RoleEntity } from "src/modules/roles/roles.entity";
import { ServiceOrder } from "src/modules/service-order/entities/service-order.entity";
import { Sector } from "src/modules/service-order/enums/sector.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    OneToMany,
} from "typeorm";
import { TaskStage } from "../enums/task.stage.enum";
import { Process } from "src/modules/process/entities/process.entity";

@Entity({name: 'task'})
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'title', length: 50, nullable: false})
    title: string;

    @Column({name: 'started_at', type:"timestamptz",nullable: true})
    startedAt: Date | null;

    @Column({name: 'completed_at', type:"timestamptz", nullable: true})
    completedAt: Date | null;

    @Column({name: 'dueDate', type: 'timestamptz', nullable: true})
    dueDate: Date | null;
    
    @Column({ name: 'stage', type: 'enum', enum: TaskStage, nullable: false })
    stage: TaskStage;

    @Column({ name: 'sector', type: 'enum', enum: Sector, nullable: false})
    sector: Sector;

    @ManyToOne(() => ServiceOrder, serviceOrder => serviceOrder.tasks, {eager:true})
    serviceOrder?: ServiceOrder;

    @Column({name: 'taskCost', type: 'numeric', nullable: true})
    taskCost: number;

    @ManyToOne(() => UserEntity, user => user.tasks, {eager:true})
    @JoinColumn({ name: 'assignedUserId'})
    assignedUser: UserEntity | null;

    @Column(() => Address)
    address: Address;

    @ManyToOne(() => RoleEntity, { eager: true , nullable:true})
    @JoinColumn({ name: 'role_name', referencedColumnName: 'name' })
    role: RoleEntity;

    @ManyToOne(() => Process, process => process.tasks)
    process: Process

    @OneToMany(() => FileEntity, (file) => file.task, {eager: true, nullable: true})
    files: FileEntity[];

    @CreateDateColumn()
    createdAt: Date
}