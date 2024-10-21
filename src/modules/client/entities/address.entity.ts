import { Column } from "typeorm";

export class Address {

    @Column({length: 9, nullable: true})
    zipCode: string;
    
    @Column({ length: 100, nullable: true })
    state: string;

    @Column({ length: 100, nullable: true })
    city: string;

    @Column({ length: 100, nullable: true })
    neighborhood: string;

    @Column({ length: 150, nullable: true })
    street: string;

    @Column({ nullable: true })
    number: string;

    @Column({ nullable: true, default: "sem complemento"})
    complement?: string; 
}
