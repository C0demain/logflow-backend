import { MigrationInterface, QueryRunner } from "typeorm";

export class ServiceOrder1726059355770 implements MigrationInterface {
    name = 'ServiceOrder1726059355770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(70) NOT NULL, "password" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."service-order_status_enum" AS ENUM('pendente', 'financeiro', 'administrativo', 'operacional', 'finalizado')`);
        await queryRunner.query(`CREATE TABLE "service-order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(50) NOT NULL, "clientRelated" character varying(50) NOT NULL, "creationDate" TIMESTAMP NOT NULL DEFAULT now(), "expirationDate" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."service-order_status_enum" NOT NULL DEFAULT 'pendente', CONSTRAINT "PK_042fac11eaef5eec1b6a455123c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "service-order"`);
        await queryRunner.query(`DROP TYPE "public"."service-order_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
