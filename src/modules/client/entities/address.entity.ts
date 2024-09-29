import { Column } from "typeorm";

export class Address {

    @Column({length: 8})
    zipCode: string;
    
    @Column({ length: 100 })
    state: string;

    @Column({ length: 100 })
    city: string;

    @Column({ length: 100 })
    neighborhood: string;

    @Column({ length: 150 })
    street: string;

    @Column()
    number: string;

    @Column({ nullable: true, default: "sem complemento"})
    complement?: string; 
}
