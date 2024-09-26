import { Column } from "typeorm";

export class Address {

    @Column({length: 8})
    cep: string;
    
    @Column({ length: 100 })
    estado: string;

    @Column({ length: 100 })
    cidade: string;

    @Column({ length: 100 })
    bairro: string;

    @Column({ length: 150 })
    rua: string;

    @Column()
    numero: string;

    @Column({ nullable: true, default: "sem complemento"})
    complemento?: string; 
}
