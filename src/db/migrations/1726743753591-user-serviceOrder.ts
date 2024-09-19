import { MigrationInterface, QueryRunner } from "typeorm";

export class UserServiceOrder1726743753591 implements MigrationInterface {
    name = 'UserServiceOrder1726743753591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."service-order_status_enum" AS ENUM('PENDENTE', 'FINANCEIRO', 'ADMINISTRATIVO', 'OPERACIONAL', 'FINALIZADO')`);
        await queryRunner.query(`CREATE TABLE "service-order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(50) NOT NULL, "clientRelated" character varying(50) NOT NULL, "creationDate" date NOT NULL DEFAULT now(), "status" "public"."service-order_status_enum" NOT NULL DEFAULT 'PENDENTE', "userId" uuid, CONSTRAINT "PK_042fac11eaef5eec1b6a455123c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('manager', 'user')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(70) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "service-order" ADD CONSTRAINT "FK_84149f36b710f3111b6808349ad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service-order" DROP CONSTRAINT "FK_84149f36b710f3111b6808349ad"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "service-order"`);
        await queryRunner.query(`DROP TYPE "public"."service-order_status_enum"`);
    }

}
