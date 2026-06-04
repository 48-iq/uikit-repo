import { MigrationInterface, QueryRunner } from 'typeorm';

export class ComponentBuildsTable1777396668044 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "component_builds" (
        "id"                 uuid    NOT NULL,
        "componentBuildId"   uuid    NOT NULL,
        "componentId"        uuid    NOT NULL,
        "componentName"      text    NOT NULL,
        "componentUsername"  text    NOT NULL,
        "packageFilename"    text    NOT NULL,
        "buildVersion"       integer NOT NULL,
        "buildId"            uuid    NOT NULL,
        CONSTRAINT "PK_component_builds" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_component_builds_buildId"           ON "component_builds" ("buildId")`);
    await queryRunner.query(`CREATE INDEX "IDX_component_builds_componentId"       ON "component_builds" ("componentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_component_builds_componentUsername" ON "component_builds" ("componentUsername")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_component_builds_componentUsername"`);
    await queryRunner.query(`DROP INDEX "IDX_component_builds_componentId"`);
    await queryRunner.query(`DROP INDEX "IDX_component_builds_buildId"`);
    await queryRunner.query(`DROP TABLE "component_builds"`);
  }
}
