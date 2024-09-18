import { MigrationInterface, QueryRunner } from "typeorm";

export class Roles1726297074286 implements MigrationInterface {
    name = 'Roles1726297074286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "roles" (
                "id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" 
                PRIMARY KEY ("id")
            )`
        );

        await queryRunner.query(
            `CREATE TABLE "users_roles_roles" (
                "usersId" uuid NOT NULL, 
                "rolesId" integer NOT NULL, 
                CONSTRAINT "PK_6c1a055682c229f5a865f2080c1" 
                PRIMARY KEY ("usersId", "rolesId")
            )`
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_df951a64f09865171d2d7a502b" ON "users_roles_roles" ("usersId") 
        `);

        await queryRunner.query(
            `CREATE INDEX "IDX_b2f0366aa9349789527e0c36d9" ON "users_roles_roles" ("rolesId") 
        `);

        await queryRunner.query(
            `ALTER TABLE "service-order" ALTER COLUMN "expirationDate" DROP DEFAULT`
        );

        await queryRunner.query(
            `ALTER TABLE "users_roles_roles" 
            ADD CONSTRAINT "FK_df951a64f09865171d2d7a502b1" 
            FOREIGN KEY ("usersId") 
            REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );

        await queryRunner.query(
            `ALTER TABLE "users_roles_roles" 
            ADD CONSTRAINT "FK_b2f0366aa9349789527e0c36d97" 
            FOREIGN KEY ("rolesId") 
            REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_roles_roles" DROP CONSTRAINT "FK_b2f0366aa9349789527e0c36d97"`);
        await queryRunner.query(`ALTER TABLE "users_roles_roles" DROP CONSTRAINT "FK_df951a64f09865171d2d7a502b1"`);
        await queryRunner.query(`ALTER TABLE "service-order" ALTER COLUMN "expirationDate" SET DEFAULT now()`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b2f0366aa9349789527e0c36d9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df951a64f09865171d2d7a502b"`);
        await queryRunner.query(`DROP TABLE "users_roles_roles"`);
        await queryRunner.query(`DROP TABLE "roles"`);
    }

}
