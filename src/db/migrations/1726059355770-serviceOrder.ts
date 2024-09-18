import { MigrationInterface, QueryRunner } from "typeorm";

export class ServiceOrder1726059355770 implements MigrationInterface {
    name = 'ServiceOrder1726059355770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."service-order_status_enum" AS ENUM(
                'pendente', 
                'financeiro', 
                'administrativo', 
                'operacional', 
                'finalizado'
            )`
        );

        await queryRunner.query(
            `CREATE TABLE "service-order" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "title" character varying(50) NOT NULL, 
                "clientRelated" character varying(50) NOT NULL,
                "creationDate" DATE NOT NULL DEFAULT now(), 
                "expirationDate" DATE NOT NULL DEFAULT now(), 
                "status" "public"."service-order_status_enum" NOT NULL DEFAULT 'pendente', 
                CONSTRAINT "PK_042fac11eaef5eec1b6a455123c" 
                PRIMARY KEY ("id")
            )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "service-order"`);
        await queryRunner.query(`DROP TYPE "public"."service-order_status_enum"`);
    }

}
