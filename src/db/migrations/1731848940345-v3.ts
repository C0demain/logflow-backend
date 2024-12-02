import { MigrationInterface, QueryRunner } from "typeorm";

export class V31731848940345 implements MigrationInterface {
    name = 'V3-1731848940345'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "isActive" TO "deactivated_at"`);
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "plate" character varying(10) NOT NULL, "model" character varying(50) NOT NULL, "brand" character varying(50) NOT NULL, "year" integer NOT NULL, "autonomy" double precision NOT NULL, "status" character varying(20) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ec7181ebdab798d97070122a5bf" UNIQUE ("plate"), CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "service-order" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "service-order" ADD "deactivated_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "task" ADD "vehicle_id" uuid`);
        await queryRunner.query(`ALTER TABLE "service-order" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deactivated_at"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deactivated_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_bbfeb81cf991c2b562c2e332f38" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_bbfeb81cf991c2b562c2e332f38"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deactivated_at"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deactivated_at" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "service-order" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "vehicle_id"`);
        await queryRunner.query(`ALTER TABLE "service-order" DROP COLUMN "deactivated_at"`);
        await queryRunner.query(`ALTER TABLE "service-order" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "deactivated_at" TO "isActive"`);
    }

}
