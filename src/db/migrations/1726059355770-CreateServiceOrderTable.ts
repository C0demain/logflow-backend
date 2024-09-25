import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateServiceOrderTable1726059355770 implements MigrationInterface {
    name = 'CreateServiceOrderTable1726059355770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."service-order_status_enum" AS ENUM(
                'PENDENTE',  
                'OPERACIONAL', 
                'FINALIZADO'
            )`
        );

        await queryRunner.query(
            `CREATE TYPE "public"."service-order_sector_enum" AS ENUM('FINANCEIRO', 'ADMINISTRATIVO', 'COMERCIAL')`,
        );

        await queryRunner.query(
            `CREATE TABLE "service-order" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "title" character varying(50) NOT NULL, 
                "clientRelated" character varying(50) NOT NULL, 
                "creationDate" date NOT NULL DEFAULT now(), 
                "status" "public"."service-order_status_enum" NOT NULL DEFAULT 'PENDENTE', 
                "sector" "public"."service-order_sector_enum" NOT NULL,       
                "userId" uuid, 
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
