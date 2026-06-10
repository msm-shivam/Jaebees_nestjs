import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase14SearchPerformanceIndexes1749201600000
  implements MigrationInterface
{
  name = 'Phase14SearchPerformanceIndexes1749201600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_products_status" ON "products" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_products_brand" ON "products" ("brand_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_products_category" ON "products" ("category_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_product_collections_product" ON "product_collections" ("product_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_product_collections_collection" ON "product_collections" ("collection_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_products_rating" ON "products" ("average_rating")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_product_variants_price" ON "product_variants" ("price")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_variants_price"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_rating"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_collections_collection"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_collections_product"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_brand"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_status"`);
  }
}
