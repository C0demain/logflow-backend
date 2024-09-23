import {
    Entity,
    Column,
    CreateDateColumn,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToOne,
    JoinColumn,
} from "typeorm";
import { Status } from "../enums/status.enum";
import { UserEntity } from "src/modules/user/user.entity";
import { Sector } from "../enums/sector.enum";
import { ApiTags } from "@nestjs/swagger";
import { Client } from "src/modules/client/entities/client.entity";

@ApiTags('service-order')
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

    @OneToOne(() => Client, { eager: true })
    @JoinColumn() 
    client: Client;
    
    @CreateDateColumn({ name: 'creationDate', type:'date'})
    creationDate: Date;

    @Column({name: 'status', type: 'enum', enum: Status, default: Status.PENDENTE})
    status: Status;

    @Column({ name: 'sector', type: 'enum', enum: Sector, nullable: false})
    sector: Sector;
}
