import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLayer2Tables1749200100000 implements MigrationInterface {
  name = 'CreateLayer2Tables1749200100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── brands ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "brands" (
        "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
        "name"        VARCHAR(150) NOT NULL,
        "slug"        VARCHAR(150) NOT NULL,
        "logo"        VARCHAR(500),
        "description" TEXT,
        "is_active"   BOOLEAN      NOT NULL DEFAULT true,
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "deleted_at"  TIMESTAMPTZ,
        CONSTRAINT "PK_brands"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_brands_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_brands_slug"      ON "brands" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_brands_is_active" ON "brands" ("is_active")`,
    );

    // ─── categories ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
        "name"        VARCHAR(150) NOT NULL,
        "slug"        VARCHAR(150) NOT NULL,
        "image"       VARCHAR(500),
        "description" TEXT,
        "sort_order"  INT          NOT NULL DEFAULT 0,
        "is_active"   BOOLEAN      NOT NULL DEFAULT true,
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "deleted_at"  TIMESTAMPTZ,
        CONSTRAINT "PK_categories"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_slug"       ON "categories" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_sort_order" ON "categories" ("sort_order")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_is_active"  ON "categories" ("is_active")`,
    );

    // ─── sub_categories ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "sub_categories" (
        "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
        "category_id" UUID         NOT NULL,
        "name"        VARCHAR(150) NOT NULL,
        "slug"        VARCHAR(150) NOT NULL,
        "image"       VARCHAR(500),
        "description" TEXT,
        "sort_order"  INT          NOT NULL DEFAULT 0,
        "is_active"   BOOLEAN      NOT NULL DEFAULT true,
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "deleted_at"  TIMESTAMPTZ,
        CONSTRAINT "PK_sub_categories"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_sub_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_sub_categories_category" FOREIGN KEY ("category_id")
          REFERENCES "categories" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_sub_categories_category_id" ON "sub_categories" ("category_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sub_categories_slug"        ON "sub_categories" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sub_categories_sort_order"  ON "sub_categories" ("sort_order")`,
    );

    // ─── collections ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "collections" (
        "id"           UUID         NOT NULL DEFAULT gen_random_uuid(),
        "name"         VARCHAR(150) NOT NULL,
        "slug"         VARCHAR(150) NOT NULL,
        "banner_image" VARCHAR(500),
        "description"  TEXT,
        "is_active"    BOOLEAN      NOT NULL DEFAULT true,
        "created_at"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "deleted_at"   TIMESTAMPTZ,
        CONSTRAINT "PK_collections"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_collections_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_collections_slug"      ON "collections" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_collections_is_active" ON "collections" ("is_active")`,
    );

    // ─── attributes ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "attributes" (
        "id"           UUID         NOT NULL DEFAULT gen_random_uuid(),
        "name"         VARCHAR(150) NOT NULL,
        "slug"         VARCHAR(150) NOT NULL,
        "is_filterable" BOOLEAN     NOT NULL DEFAULT false,
        "is_required"   BOOLEAN      NOT NULL DEFAULT false,
        "sort_order"   INT          NOT NULL DEFAULT 0,
        "created_at"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_attributes"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_attributes_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_attributes_slug"       ON "attributes" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_attributes_sort_order" ON "attributes" ("sort_order")`,
    );

    // ─── attribute_values ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "attribute_values" (
        "id"           UUID         NOT NULL DEFAULT gen_random_uuid(),
        "attribute_id" UUID         NOT NULL,
        "value"        VARCHAR(150) NOT NULL,
        "slug"         VARCHAR(150) NOT NULL,
        "sort_order"   INT          NOT NULL DEFAULT 0,
        "created_at"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_attribute_values" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_attribute_values_attribute_slug" UNIQUE ("attribute_id", "slug"),
        CONSTRAINT "FK_attribute_values_attribute" FOREIGN KEY ("attribute_id")
          REFERENCES "attributes" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_attribute_values_attribute_id" ON "attribute_values" ("attribute_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_attribute_values_slug"         ON "attribute_values" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_attribute_values_sort_order"   ON "attribute_values" ("sort_order")`,
    );

    // ─── product_tags ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "product_tags" (
        "id"         UUID         NOT NULL DEFAULT gen_random_uuid(),
        "name"       VARCHAR(150) NOT NULL,
        "slug"       VARCHAR(150) NOT NULL,
        "created_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_tags"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_tags_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_tags_slug" ON "product_tags" ("slug")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "product_tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attribute_values"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attributes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "collections"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sub_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "brands"`);
  }
}
