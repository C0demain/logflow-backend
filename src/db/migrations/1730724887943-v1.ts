import { MigrationInterface, QueryRunner } from "typeorm";

export class V11730724887943 implements MigrationInterface {
    name = 'V1-1730724887943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."roles_sector_enum" AS ENUM('OPERACIONAL', 'FINANCEIRO', 'RH', 'DIRETORIA', 'VENDAS')`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" character varying(255) NOT NULL, "sector" "public"."roles_sector_enum" NOT NULL, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "data" bytea NOT NULL, "filename" character varying NOT NULL, "mimetype" character varying NOT NULL, "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "taskId" uuid, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."task_stage_enum" AS ENUM('VENDA REALIZADA', 'EMISSÃO DE DOCUMENTOS DE COLETA', 'COLETA', 'EMISSÃO DE DOCUMENTOS DE ENTREGA', 'ENTREGA', 'CONFIRMAÇÃO DE ENTREGA', 'CONFERÊNCIA DE ORÇAMENTO')`);
        await queryRunner.query(`CREATE TYPE "public"."task_sector_enum" AS ENUM('OPERACIONAL', 'FINANCEIRO', 'RH', 'DIRETORIA', 'VENDAS')`);
        await queryRunner.query(`CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(50) NOT NULL, "started_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, "dueDate" TIMESTAMP WITH TIME ZONE, "stage" "public"."task_stage_enum" NOT NULL, "sector" "public"."task_sector_enum" NOT NULL, "taskCost" numeric, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "serviceOrderId" uuid, "assignedUserId" uuid, "role_name" character varying(100), "addressZipcode" character varying(9), "addressState" character varying(100), "addressCity" character varying(100), "addressNeighborhood" character varying(100), "addressStreet" character varying(150), "addressNumber" character varying, "addressComplement" character varying DEFAULT 'sem complemento', CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_sector_enum" AS ENUM('OPERACIONAL', 'FINANCEIRO', 'RH', 'DIRETORIA', 'VENDAS')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(70) NOT NULL, "password" character varying(255) NOT NULL, "sector" "public"."users_sector_enum" NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "role_id" uuid NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "client" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "phone" character varying(15) NOT NULL, "cnpj" character varying(18) NOT NULL, "email" character varying(40) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "addressZipcode" character varying(9), "addressState" character varying(100), "addressCity" character varying(100), "addressNeighborhood" character varying(100), "addressStreet" character varying(150), "addressNumber" character varying, "addressComplement" character varying DEFAULT 'sem complemento', CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service-order-log" ("id" SERIAL NOT NULL, "changedTo" character varying NOT NULL, "creationDate" TIMESTAMP NOT NULL DEFAULT now(), "serviceOrderId" uuid, CONSTRAINT "PK_068aa783fd77295600586a74037" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."service-order_status_enum" AS ENUM('PENDENTE', 'ATIVO', 'FINALIZADO')`);
        await queryRunner.query(`CREATE TYPE "public"."service-order_sector_enum" AS ENUM('OPERACIONAL', 'FINANCEIRO', 'RH', 'DIRETORIA', 'VENDAS')`);
        await queryRunner.query(`CREATE TABLE "service-order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(50) NOT NULL, "status" "public"."service-order_status_enum" NOT NULL DEFAULT 'PENDENTE', "sector" "public"."service-order_sector_enum" NOT NULL, "creationDate" date NOT NULL DEFAULT now(), "isActive" boolean NOT NULL DEFAULT true, "description" character varying NOT NULL, "value" numeric(10,2), "userId" uuid, "clientId" uuid, CONSTRAINT "PK_042fac11eaef5eec1b6a455123c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "files" ADD CONSTRAINT "FK_7e7425b17f9e707331e9a6c7335" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "files" ADD CONSTRAINT "FK_c16e3dee54f3fecdc183c265ae4" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_76ff37436c41244f8ab64c12aa7" FOREIGN KEY ("serviceOrderId") REFERENCES "service-order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_e3bd734666db0cb70e8c8d542c8" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_7628a86705179622b78a41dbfde" FOREIGN KEY ("role_name") REFERENCES "roles"("name") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service-order-log" ADD CONSTRAINT "FK_a35b22f5b52b53231ac9d133726" FOREIGN KEY ("serviceOrderId") REFERENCES "service-order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service-order" ADD CONSTRAINT "FK_84149f36b710f3111b6808349ad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service-order" ADD CONSTRAINT "FK_e180b219705e010be8c0eb68feb" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service-order" DROP CONSTRAINT "FK_e180b219705e010be8c0eb68feb"`);
        await queryRunner.query(`ALTER TABLE "service-order" DROP CONSTRAINT "FK_84149f36b710f3111b6808349ad"`);
        await queryRunner.query(`ALTER TABLE "service-order-log" DROP CONSTRAINT "FK_a35b22f5b52b53231ac9d133726"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_7628a86705179622b78a41dbfde"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_e3bd734666db0cb70e8c8d542c8"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_76ff37436c41244f8ab64c12aa7"`);
        await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_c16e3dee54f3fecdc183c265ae4"`);
        await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_7e7425b17f9e707331e9a6c7335"`);
        await queryRunner.query(`DROP TABLE "service-order"`);
        await queryRunner.query(`DROP TYPE "public"."service-order_sector_enum"`);
        await queryRunner.query(`DROP TYPE "public"."service-order_status_enum"`);
        await queryRunner.query(`DROP TABLE "service-order-log"`);
        await queryRunner.query(`DROP TABLE "client"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_sector_enum"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TYPE "public"."task_sector_enum"`);
        await queryRunner.query(`DROP TYPE "public"."task_stage_enum"`);
        await queryRunner.query(`DROP TABLE "files"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TYPE "public"."roles_sector_enum"`);
    }

}
