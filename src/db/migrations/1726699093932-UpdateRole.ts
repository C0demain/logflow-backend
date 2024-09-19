import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRole1726699093932 implements MigrationInterface {
    name = 'UpdateRole1726699093932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "role" character varying(100) NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TYPE "public"."service-order_status_enum" RENAME TO "service-order_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."service-order_status_enum" AS ENUM('PENDENTE', 'FINANCEIRO', 'ADMINISTRATIVO', 'OPERACIONAL', 'FINALIZADO')`);
        await queryRunner.query(`ALTER TABLE "service-order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "service-order" ALTER COLUMN "status" TYPE "public"."service-order_status_enum" USING "status"::"text"::"public"."service-order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "service-order" ALTER COLUMN "status" SET DEFAULT 'PENDENTE'`);
        await queryRunner.query(`DROP TYPE "public"."service-order_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."service-order_status_enum_old" AS ENUM('pendente', 'financeiro', 'administrativo', 'operacional', 'finalizado')`);
        await queryRunner.query(`ALTER TABLE "service-order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "service-order" ALTER COLUMN "status" TYPE "public"."service-order_status_enum_old" USING "status"::"text"::"public"."service-order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "service-order" ALTER COLUMN "status" SET DEFAULT 'pendente'`);
        await queryRunner.query(`DROP TYPE "public"."service-order_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."service-order_status_enum_old" RENAME TO "service-order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    }

}
