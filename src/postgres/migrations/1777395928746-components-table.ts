import { MigrationInterface, QueryRunner } from 'typeorm';

export class ComponentsTable1777395928746 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE TABLE "components" (
        "id" char varying NOT NULL,
        "version" char varying NOT NULL,
        CONSTRAINT "PK_component_id" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      DROP TABLE "components";
    `);
  }
}

/*
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE TABLE "components" (
    "id" char varying NOT NULL ,
    "name" character varying NOT NULL,
    "description" character varying NOT NULL,
    "username" character varying NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    "updatedAt" TIMESTAMP,
    "framework" character varying NOT NULL,
    CONSTRAINT "PK_component_id" PRIMARY KEY ("id")
  ) 
*/
