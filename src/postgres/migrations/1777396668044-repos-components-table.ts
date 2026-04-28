import { MigrationInterface, QueryRunner } from "typeorm";

export class ReposComponentsTable1777396668044 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      queryRunner.query(`
        CREATE TABLE "repos_components" (
          "repoId" char varying NOT NULL,
          "componentId" char varying NOT NULL,
          CONSTRAINT "PK_repos_components" PRIMARY KEY ("repoId", "componentId")
        );
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      queryRunner.query(`
        DROP TABLE "repos_components";
      `)
    }

}
