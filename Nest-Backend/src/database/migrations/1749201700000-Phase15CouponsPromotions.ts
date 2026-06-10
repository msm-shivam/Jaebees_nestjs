import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase15CouponsPromotions1749201700000 implements MigrationInterface {
  name = 'Phase15CouponsPromotions1749201700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create coupon_type enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."coupons_type_enum" AS ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // Create promotion_type enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."promotions_type_enum" AS ENUM('PRODUCT_DISCOUNT', 'CATEGORY_DISCOUNT', 'CART_DISCOUNT', 'BUY_X_GET_Y', 'FLASH_SALE');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // Create campaign_type enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."campaigns_type_enum" AS ENUM('SUMMER_SALE', 'FESTIVAL_SALE', 'CLEARANCE', 'BLACK_FRIDAY', 'CUSTOM');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // Drop old tables if they exist from Layer 9 (will be recreated with new schema)
    await queryRunner.query(`DROP TABLE IF EXISTS "discount_rules" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "coupon_usages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "promotions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "coupons" CASCADE`);

    // Create coupons table
    await queryRunner.query(`
      CREATE TABLE "coupons" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(50) NOT NULL,
        "type" "public"."coupons_type_enum" NOT NULL,
        "value" decimal(10,2) NOT NULL,
        "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "max_uses" integer,
        "max_uses_per_user" integer,
        "minimum_order_amount" decimal(10,2) NOT NULL DEFAULT '0',
        "maximum_discount_amount" decimal(10,2),
        "first_order_only" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_stackable" boolean NOT NULL DEFAULT false,
        "usage_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_coupons_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_coupons_code" UNIQUE ("code")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_coupons_active_period" ON "coupons" ("is_active", "start_date", "end_date")`);

    // Create coupon_usages table
    await queryRunner.query(`
      CREATE TABLE "coupon_usages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "coupon_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "order_id" uuid NOT NULL,
        "discount_amount" decimal(10,2) NOT NULL,
        "used_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_coupon_usages_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_coupon_usages_coupon" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_coupon_usages_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_coupon_usages_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_coupon_usages_coupon" ON "coupon_usages" ("coupon_id")`);
    await queryRunner.query(`CREATE INDEX "idx_coupon_usages_user" ON "coupon_usages" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_coupon_usages_order" ON "coupon_usages" ("order_id")`);

    // Create promotions table
    await queryRunner.query(`
      CREATE TABLE "promotions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(200) NOT NULL,
        "description" text,
        "type" "public"."promotions_type_enum" NOT NULL,
        "discount_value" decimal(10,2) NOT NULL,
        "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "priority" integer NOT NULL DEFAULT 0,
        "is_stackable" boolean NOT NULL DEFAULT false,
        "auto_apply" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_promotions_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_promotions_active_period" ON "promotions" ("is_active", "start_date", "end_date")`);
    await queryRunner.query(`CREATE INDEX "idx_promotions_priority" ON "promotions" ("priority")`);

    // Create promotion_products table
    await queryRunner.query(`
      CREATE TABLE "promotion_products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "promotion_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_promotion_products_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_promotion_products_promotion" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_promotion_products_promotion" ON "promotion_products" ("promotion_id")`);
    await queryRunner.query(`CREATE INDEX "idx_promotion_products_product" ON "promotion_products" ("product_id")`);

    // Create promotion_categories table
    await queryRunner.query(`
      CREATE TABLE "promotion_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "promotion_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_promotion_categories_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_promotion_categories_promotion" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_promotion_categories_promotion" ON "promotion_categories" ("promotion_id")`);
    await queryRunner.query(`CREATE INDEX "idx_promotion_categories_category" ON "promotion_categories" ("category_id")`);

    // Create campaigns table
    await queryRunner.query(`
      CREATE TABLE "campaigns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(200) NOT NULL,
        "description" text,
        "type" "public"."campaigns_type_enum" NOT NULL,
        "banner_url" character varying(500),
        "landing_page_url" character varying(500),
        "discount_value" decimal(10,2),
        "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "priority" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_campaigns_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_campaigns_active_period" ON "campaigns" ("is_active", "start_date", "end_date")`);
    await queryRunner.query(`CREATE INDEX "idx_campaigns_type" ON "campaigns" ("type")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "campaigns" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "promotion_categories" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "promotion_products" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "promotions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "coupon_usages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "coupons" CASCADE`);

    await queryRunner.query(`DROP TYPE IF EXISTS "public"."campaigns_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."promotions_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."coupons_type_enum"`);
  }
}
