import { MigrationInterface, QueryRunner } from "typeorm";

export class V51733530609591 implements MigrationInterface {
    name = 'V5-1733530609591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service-order-log" RENAME COLUMN "changedTo" TO "action"`);
        await queryRunner.query(`ALTER TABLE "service-order" RENAME COLUMN "title" TO "code"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "refresh_token" text`);
        await queryRunner.query(`ALTER TABLE "service-order" ADD CONSTRAINT "UQ_12fff33642fb6b1af165a6b4df7" UNIQUE ("code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service-order" DROP CONSTRAINT "UQ_12fff33642fb6b1af165a6b4df7"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refresh_token"`);
        await queryRunner.query(`ALTER TABLE "service-order" RENAME COLUMN "code" TO "title"`);
        await queryRunner.query(`ALTER TABLE "service-order-log" RENAME COLUMN "action" TO "changedTo"`);
    }

}
