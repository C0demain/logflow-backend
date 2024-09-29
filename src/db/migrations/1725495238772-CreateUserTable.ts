import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1725495238772 implements MigrationInterface {
    name = 'CreateUserTable1725495238772'
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."users_role_enum" AS ENUM('MANAGER', 'EMPLOYEE')`,
        );

        await queryRunner.query(
            `CREATE TYPE "public"."users_sector_enum" AS ENUM('FINANCEIRO', 'OPERACIONAL', 'COMERCIAL')`,
        );
        
        await queryRunner.query(
            `CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "name" character varying(100) NOT NULL, 
                "email" character varying(70) NOT NULL, 
                "password" character varying(255) NOT NULL, 
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'EMPLOYEE',
                "sector" "public"."users_sector_enum" NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                PRIMARY KEY ("id")
            )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_sector_enum"`);
    }

}