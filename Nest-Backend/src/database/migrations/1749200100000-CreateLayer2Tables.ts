import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLayer2Tables1749200100000 implements MigrationInterface {
  name = 'CreateLayer2Tables1749200100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── Product status & gender enums ───────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "public"."product_status_enum" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."product_gender_enum" AS ENUM ('MEN', 'WOMEN', 'UNISEX', 'KIDS')
    `);

    // ─── categories ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id"               UUID         NOT NULL DEFAULT gen_random_uuid(),
        "name"             VARCHAR(150) NOT NULL,
        "slug"             VARCHAR(150) NOT NULL,
        "description"      TEXT,
        "image_url"        VARCHAR(500),
        "parent_id"        UUID,
        "is_active"        BOOLEAN      NOT NULL DEFAULT true,
        "sort_order"       INT          NOT NULL DEFAULT 0,
        "meta_title"       VARCHAR(200),
        "meta_description" VARCHAR(500),
        "created_at"       TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "deleted_at"       TIMESTAMPTZ,
        CONSTRAINT "PK_categories"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_categories_parent" FOREIGN KEY ("parent_id")
          REFERENCES "categories" ("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_categories_slug"      ON "categories" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_categories_parent_id" ON "categories" ("parent_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_categories_is_active" ON "categories" ("is_active")`);

    // ─── brands ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "brands" (
        "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
        "name"        VARCHAR(150) NOT NULL,
        "slug"        VARCHAR(150) NOT NULL,
        "description" TEXT,
        "logo_url"    VARCHAR(500),
        "website_url" VARCHAR(500),
        "is_active"   BOOLEAN      NOT NULL DEFAULT true,
        "sort_order"  INT          NOT NULL DEFAULT 0,
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "deleted_at"  TIMESTAMPTZ,
        CONSTRAINT "PK_brands"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_brands_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_brands_slug"      ON "brands" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_brands_is_active" ON "brands" ("is_active")`);

    // ─── products ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id"                UUID                        NOT NULL DEFAULT gen_random_uuid(),
        "name"              VARCHAR(250)                NOT NULL,
        "slug"              VARCHAR(250)                NOT NULL,
        "short_description" VARCHAR(500),
        "description"       TEXT,
        "status"            "product_status_enum"       NOT NULL DEFAULT 'DRAFT',
        "gender"            "product_gender_enum"       NOT NULL DEFAULT 'UNISEX',
        "base_price"        NUMERIC(10,2)               NOT NULL,
        "compare_price"     NUMERIC(10,2),
        "cost_price"        NUMERIC(10,2),
        "sku"               VARCHAR(100),
        "barcode"           VARCHAR(100),
        "is_featured"       BOOLEAN                     NOT NULL DEFAULT false,
        "is_digital"        BOOLEAN                     NOT NULL DEFAULT false,
        "weight"            NUMERIC(8,3),
        "category_id"       UUID,
        "brand_id"          UUID,
        "meta_title"        VARCHAR(200),
        "meta_description"  VARCHAR(500),
        "tags"              VARCHAR[]                   NOT NULL DEFAULT '{}',
        "created_at"        TIMESTAMPTZ                 NOT NULL DEFAULT now(),
        "updated_at"        TIMESTAMPTZ                 NOT NULL DEFAULT now(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "PK_products"         PRIMARY KEY ("id"),
        CONSTRAINT "UQ_products_slug"    UNIQUE ("slug"),
        CONSTRAINT "FK_products_category" FOREIGN KEY ("category_id")
          REFERENCES "categories" ("id") ON DELETE SET NULL,
        CONSTRAINT "FK_products_brand"   FOREIGN KEY ("brand_id")
          REFERENCES "brands" ("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_products_slug"        ON "products" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_category_id" ON "products" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_brand_id"    ON "products" ("brand_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_status"      ON "products" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_gender"      ON "products" ("gender")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_is_featured" ON "products" ("is_featured")`);

    // ─── product_images ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "product_images" (
        "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
        "product_id"  UUID         NOT NULL,
        "url"         VARCHAR(500) NOT NULL,
        "alt_text"    VARCHAR(250),
        "sort_order"  INT          NOT NULL DEFAULT 0,
        "is_primary"  BOOLEAN      NOT NULL DEFAULT false,
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_images"         PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_images_product" FOREIGN KEY ("product_id")
          REFERENCES "products" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_product_images_product_id" ON "product_images" ("product_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_product_images_is_primary" ON "product_images" ("is_primary")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "product_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "brands"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."product_gender_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."product_status_enum"`);
  }
}
