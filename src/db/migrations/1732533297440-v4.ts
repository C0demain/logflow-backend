import { MigrationInterface, QueryRunner } from "typeorm";

export class V41732533297440 implements MigrationInterface {
    name = 'V4-1732533297440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "room_message" ("id" SERIAL NOT NULL, "senderId" character varying NOT NULL, "roomName" character varying NOT NULL, "content" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4d4598ed140cbdaf3e9879aca1a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "private_message" ("id" SERIAL NOT NULL, "senderId" character varying NOT NULL, "recipientId" character varying NOT NULL, "content" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dfe66cf2f224c9dc8be6ca5fde7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "private_message"`);
        await queryRunner.query(`DROP TABLE "room_message"`);
    }

}
