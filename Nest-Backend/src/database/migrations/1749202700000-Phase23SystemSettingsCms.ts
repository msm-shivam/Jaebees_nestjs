import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase23SystemSettingsCms1749202700000 implements MigrationInterface {
  name = 'Phase23SystemSettingsCms1749202700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."cms_page_status_enum" AS ENUM ('DRAFT', 'PUBLISHED')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."cms_page_type_enum" AS ENUM (
        'ABOUT_US', 'PRIVACY_POLICY', 'TERMS_AND_CONDITIONS',
        'SHIPPING_POLICY', 'RETURN_POLICY', 'CONTACT_US', 'CUSTOM_PAGE'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "system_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "key" character varying(255) NOT NULL,
        "value" text NOT NULL,
        "category" character varying(100),
        CONSTRAINT "PK_system_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_system_settings_key" UNIQUE ("key")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_system_settings_key" ON "system_settings" ("key")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_system_settings_category" ON "system_settings" ("category")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_system_settings_created_at" ON "system_settings" ("created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "cms_pages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "title" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "content" text NOT NULL,
        "status" "public"."cms_page_status_enum" NOT NULL DEFAULT 'DRAFT',
        "page_type" "public"."cms_page_type_enum",
        CONSTRAINT "PK_cms_pages" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_cms_pages_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_cms_pages_slug" ON "cms_pages" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cms_pages_status" ON "cms_pages" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cms_pages_page_type" ON "cms_pages" ("page_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cms_pages_created_at" ON "cms_pages" ("created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "homepage_sections" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "section_key" character varying(100) NOT NULL,
        "title" character varying(255) NOT NULL,
        "content_json" jsonb NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_homepage_sections" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_homepage_sections_section_key" ON "homepage_sections" ("section_key")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_homepage_sections_sort_order" ON "homepage_sections" ("sort_order")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_homepage_sections_created_at" ON "homepage_sections" ("created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "contact_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "email" character varying(255) NOT NULL,
        "phone" character varying(50),
        "address" text,
        "support_hours" character varying(255),
        CONSTRAINT "PK_contact_settings" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "site_configurations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "site_name" character varying(255) NOT NULL,
        "logo_url" character varying(500),
        "favicon_url" character varying(500),
        "maintenance_mode" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_site_configurations" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "site_configurations"`);
    await queryRunner.query(`DROP TABLE "contact_settings"`);
    await queryRunner.query(`DROP TABLE "homepage_sections"`);
    await queryRunner.query(`DROP TABLE "cms_pages"`);
    await queryRunner.query(`DROP TABLE "system_settings"`);
    await queryRunner.query(`DROP TYPE "public"."cms_page_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."cms_page_status_enum"`);
  }
}
