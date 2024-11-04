import { Task } from "src/modules/task/entities/task.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Process {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    title: string

    @OneToMany(() => Task, (task) => task.process, {eager: true})
    tasks: Task[]
}
