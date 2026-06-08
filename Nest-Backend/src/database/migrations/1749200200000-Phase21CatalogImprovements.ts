import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 2.1 — Catalog Relationship Improvements
 *
 * Changes (all additive — no existing columns dropped):
 *
 * 1. Add deleted_at to: attributes, attribute_values, product_tags
 * 2. Create product_collections  (product ↔ collection many-to-many)
 * 3. Create product_tag_mappings (product ↔ tag      many-to-many)
 *
 * NOTE: product_id FK constraints on the two join tables will be added
 * in the Product migration when the products table is created.
 */
export class Phase21CatalogImprovements1749200200000 implements MigrationInterface {
  name = 'Phase21CatalogImprovements1749200200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── 1. Soft-delete columns ────────────────────────────────────────────

    await queryRunner.query(`
      ALTER TABLE "attributes"
        ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ
    `);

    await queryRunner.query(`
      ALTER TABLE "attribute_values"
        ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ
    `);

    await queryRunner.query(`
      ALTER TABLE "product_tags"
        ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ
    `);

    // ─── 2. product_collections join table ────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "product_collections" (
        "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
        "product_id"    UUID        NOT NULL,
        "collection_id" UUID        NOT NULL,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_collections"        PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_collections_pair"   UNIQUE ("product_id", "collection_id"),
        CONSTRAINT "FK_product_collections_collection"
          FOREIGN KEY ("collection_id")
          REFERENCES "collections" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_product_collections_product_id"
        ON "product_collections" ("product_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_product_collections_collection_id"
        ON "product_collections" ("collection_id")
    `);

    // ─── 3. product_tag_mappings join table ───────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "product_tag_mappings" (
        "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
        "product_id" UUID        NOT NULL,
        "tag_id"     UUID        NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_tag_mappings"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_tag_mappings_pair" UNIQUE ("product_id", "tag_id"),
        CONSTRAINT "FK_product_tag_mappings_tag"
          FOREIGN KEY ("tag_id")
          REFERENCES "product_tags" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_product_tag_mappings_product_id"
        ON "product_tag_mappings" ("product_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_product_tag_mappings_tag_id"
        ON "product_tag_mappings" ("tag_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop join tables
    await queryRunner.query(`DROP TABLE IF EXISTS "product_tag_mappings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_collections"`);

    // Remove soft-delete columns
    await queryRunner.query(
      `ALTER TABLE "product_tags"     DROP COLUMN IF EXISTS "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attribute_values" DROP COLUMN IF EXISTS "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attributes"       DROP COLUMN IF EXISTS "deleted_at"`,
    );
  }
}
