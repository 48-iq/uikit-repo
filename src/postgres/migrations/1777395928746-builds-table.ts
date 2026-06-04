import { MigrationInterface, QueryRunner } from 'typeorm';

export class BuildsTable1777395928746 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE TYPE "builds_status_enum" AS ENUM ('pending', 'running', 'success', 'failed')`);
    await queryRunner.query(`
      CREATE TABLE "builds" (
        "id"         uuid                 NOT NULL DEFAULT uuid_generate_v4(),
        "repoId"     uuid                 NOT NULL,
        "version"    integer              NOT NULL DEFAULT 1,
        "status"     "builds_status_enum" NOT NULL DEFAULT 'pending',
        "logs"       text,
        "startedAt"  TIMESTAMP            NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMP            NOT NULL DEFAULT now(),
        "finishedAt" TIMESTAMP,
        "type"       character varying    NOT NULL DEFAULT 'repo',
        CONSTRAINT "PK_builds" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_builds_repoId"    ON "builds" ("repoId")`);
    await queryRunner.query(`CREATE INDEX "IDX_builds_status"    ON "builds" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_builds_startedAt" ON "builds" ("startedAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_builds_startedAt"`);
    await queryRunner.query(`DROP INDEX "IDX_builds_status"`);
    await queryRunner.query(`DROP INDEX "IDX_builds_repoId"`);
    await queryRunner.query(`DROP TABLE "builds"`);
    await queryRunner.query(`DROP TYPE "builds_status_enum"`);
  }
}
