import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReposTable1777395957583 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE TABLE "repos" (
        "id" char varying NOT NULL,
        "version" char varying NOT NULL,
        CONSTRAINT "PK_repo_id" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE "repos";`);
  }
}
