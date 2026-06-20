import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase25StoreSettings1791865863920 implements MigrationInterface {
  name = 'Phase25StoreSettings1791865863920';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "store_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "store_name" character varying(255) NOT NULL DEFAULT 'Sport Ecom',
        "store_tagline" character varying(255) NOT NULL DEFAULT 'India''s Sports Marketplace',
        "store_email" character varying(255) NOT NULL DEFAULT 'support@sportecom.com',
        "support_email" character varying(255) NOT NULL DEFAULT 'help@sportecom.com',
        "phone" character varying(50) NOT NULL DEFAULT '+91XXXXXXXXXX',
        "whatsapp" character varying(50) NOT NULL DEFAULT '+91XXXXXXXXXX',
        "website_url" character varying(255) NOT NULL DEFAULT 'https://sportecom.com',
        "logo_url" character varying(500),
        "favicon_url" character varying(500),
        "description" text,
        "address_line1" character varying(255),
        "address_line2" character varying(255),
        "city" character varying(100),
        "state" character varying(100),
        "country" character varying(100),
        "postal_code" character varying(20),
        "latitude" numeric(10,6),
        "longitude" numeric(10,6),
        "facebook" character varying(255) DEFAULT '',
        "instagram" character varying(255) DEFAULT '',
        "twitter" character varying(255) DEFAULT '',
        "youtube" character varying(255) DEFAULT '',
        "linkedin" character varying(255) DEFAULT '',
        "telegram" character varying(255) DEFAULT '',
        "whatsapp_social" character varying(255) DEFAULT '',
        "from_name" character varying(255) DEFAULT 'Sport Ecom',
        "from_email" character varying(255) DEFAULT 'support@sportecom.com',
        "reply_to_email" character varying(255) DEFAULT 'help@sportecom.com',
        "company_name" character varying(255) DEFAULT '',
        "gst_number" character varying(50) DEFAULT '',
        "pan_number" character varying(50) DEFAULT '',
        "cin_number" character varying(50) DEFAULT '',
        "bank_name" character varying(255) DEFAULT '',
        "account_number" character varying(100) DEFAULT '',
        "ifsc_code" character varying(50) DEFAULT '',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_store_settings_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "store_settings" (
        "store_name", "store_tagline", "store_email", "support_email", "phone", "whatsapp", "website_url"
      ) VALUES (
        'Sport Ecom', 'India''s Sports Marketplace', 'support@sportecom.com', 'help@sportecom.com', '+91XXXXXXXXXX', '+91XXXXXXXXXX', 'https://sportecom.com'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "store_settings"`);
  }
}
