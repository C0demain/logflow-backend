import { MigrationInterface, QueryRunner } from "typeorm";

export class V21730977586821 implements MigrationInterface {
    name = 'V2-1730977586821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "process" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, CONSTRAINT "PK_d5e3ab0f6df55ee74ca24967952" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "task" ADD "processId" uuid`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_b8eb56f39a6156313c6128c8e46" FOREIGN KEY ("processId") REFERENCES "process"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_b8eb56f39a6156313c6128c8e46"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "processId"`);
        await queryRunner.query(`DROP TABLE "process"`);
    }

}
