import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReposTable1777395957583 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "repos_tags_enum" AS ENUM (
        -- тип
        'ui_kit', 'компонентная_библиотека', 'дизайн_система', 'шаблон', 'утилиты', 'хуки', 'иконки', 'шрифты', 'токены',

        -- фреймворк
        'react', 'vue', 'svelte', 'angular', 'solid', 'vanilla',

        -- платформа
        'веб', 'мобильный', 'десктоп', 'адаптивный', 'кроссплатформенный',

        -- стек
        'typescript', 'javascript', 'tailwind', 'sass', 'css_модули', 'styled_components', 'css_in_js',

        -- назначение
        'формы', 'таблицы', 'навигация', 'графики', 'карты', 'анимация', 'медиа', 'типографика',
        'модальные_окна', 'уведомления', 'компоновка', 'ввод_данных', 'отображение_данных',

        -- стиль
        'минималистичный', 'насыщенный', 'материальный', 'плоский', 'неоморфизм', 'glassmorphism',
        'тёмная_тема', 'светлая_тема', 'темизированный',

        -- доступность
        'доступный', 'поддержка_aria', 'клавиатурная_навигация',

        -- совместимость
        'готов_к_ssr', 'интернационализация', 'поддержка_rtl', 'seo_оптимизирован'
      );

      CREATE TABLE "repos" (
        "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "username"    character varying NOT NULL,
        "name"        character varying NOT NULL,
        "description" character varying NOT NULL,
        "createdAt"   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        "updatedAt"   TIMESTAMP,
        "tags" "repos_tags_enum"[] NOT NULL DEFAULT '{}',
        CONSTRAINT "PK_repos" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_repos_username" ON "repos" ("username")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_repos_username"`);
    await queryRunner.query(`DROP TABLE "repos"`);
    await queryRunner.query(`DROP TYPE "repos_tags_enum";`);
  }
}
