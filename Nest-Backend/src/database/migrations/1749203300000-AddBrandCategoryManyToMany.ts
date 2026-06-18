import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBrandCategoryManyToMany1749203300000
  implements MigrationInterface
{
  name = 'AddBrandCategoryManyToMany1749203300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "brand_categories" (
        "brand_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        CONSTRAINT "PK_brand_categories" PRIMARY KEY ("brand_id", "category_id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_brand_categories_brand_id" ON "brand_categories" ("brand_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_brand_categories_category_id" ON "brand_categories" ("category_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "brand_categories" ADD CONSTRAINT "FK_brand_categories_brand" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "brand_categories" ADD CONSTRAINT "FK_brand_categories_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "brand_categories" DROP CONSTRAINT "FK_brand_categories_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "brand_categories" DROP CONSTRAINT "FK_brand_categories_brand"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_brand_categories_category_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_brand_categories_brand_id"`,
    );
    await queryRunner.query(`DROP TABLE "brand_categories"`);
  }
}
