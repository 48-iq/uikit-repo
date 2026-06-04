import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReposTable1777395957583 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "repos" (
        "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "username"    character varying NOT NULL,
        "name"        character varying NOT NULL,
        "description" character varying NOT NULL,
        "createdAt"   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        "updatedAt"   TIMESTAMP,
        CONSTRAINT "PK_repos" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_repos_username" ON "repos" ("username")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_repos_username"`);
    await queryRunner.query(`DROP TABLE "repos"`);
  }
}
