import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase19EmailNotifications1749202300000 implements MigrationInterface {
  name = 'Phase19EmailNotifications1749202300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enums
    await queryRunner.query(`
      CREATE TYPE "public"."notification_status_enum" AS ENUM (
        'PENDING', 'SENT', 'FAILED', 'BOUNCED', 'OPENED', 'CLICKED'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."transactional_email_type_enum" AS ENUM (
        'ORDER_CREATED', 'ORDER_CONFIRMED', 'ORDER_SHIPPED', 'ORDER_DELIVERED',
        'ORDER_CANCELLED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED',
        'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_REJECTED', 'RETURN_REFUNDED',
        'SUPPORT_TICKET_CREATED', 'SUPPORT_REPLY', 'PASSWORD_RESET',
        'ACCOUNT_CREATED', 'WELCOME_EMAIL', 'COUPON_ASSIGNED',
        'PROMOTION_STARTED', 'CUSTOM'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."campaign_status_enum" AS ENUM (
        'DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED', 'COMPLETED'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."campaign_type_enum" AS ENUM (
        'PROMOTIONAL', 'ABANDONED_CART', 'FLASH_SALE', 'SEASONAL', 'NEW_ARRIVAL', 'CUSTOM'
      )
    `);

    // email_notification_templates
    await queryRunner.query(`
      CREATE TABLE "email_notification_templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "code" character varying(100) NOT NULL,
        "name" character varying(255) NOT NULL,
        "subject_template" character varying(500) NOT NULL,
        "body_template" text NOT NULL,
        "variables" jsonb NOT NULL DEFAULT '[]',
        "active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_email_notification_templates" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_email_notification_templates_code" UNIQUE ("code")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_email_notification_templates_code" ON "email_notification_templates" ("code")`,
    );

    // email_preferences
    await queryRunner.query(`
      CREATE TABLE "email_preferences" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "user_id" uuid NOT NULL,
        "marketing_emails_enabled" boolean NOT NULL DEFAULT true,
        "transactional_emails_enabled" boolean NOT NULL DEFAULT true,
        "order_updates" boolean NOT NULL DEFAULT true,
        "promotions_and_offers" boolean NOT NULL DEFAULT true,
        "product_recommendations" boolean NOT NULL DEFAULT true,
        "newsletter" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_email_preferences" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_email_preferences_user_id" UNIQUE ("user_id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_email_preferences_user_id" ON "email_preferences" ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_preferences" ADD CONSTRAINT "FK_email_preferences_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );

    // email_notifications
    await queryRunner.query(`
      CREATE TABLE "email_notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "user_id" uuid,
        "template_id" uuid,
        "subject" character varying(255) NOT NULL,
        "body" text NOT NULL,
        "recipient_email" character varying(255) NOT NULL,
        "status" "public"."notification_status_enum" NOT NULL DEFAULT 'PENDING',
        "type" "public"."transactional_email_type_enum" NOT NULL DEFAULT 'CUSTOM',
        "sent_at" TIMESTAMP WITH TIME ZONE,
        "read_at" TIMESTAMP WITH TIME ZONE,
        "retries" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_email_notifications" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_email_notifications_user_id" ON "email_notifications" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_email_notifications_status" ON "email_notifications" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_email_notifications_created_at" ON "email_notifications" ("created_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notifications" ADD CONSTRAINT "FK_email_notifications_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notifications" ADD CONSTRAINT "FK_email_notifications_template_id" FOREIGN KEY ("template_id") REFERENCES "email_notification_templates"("id") ON DELETE SET NULL`,
    );

    // email_logs
    await queryRunner.query(`
      CREATE TABLE "email_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "notification_id" uuid,
        "provider" character varying(100) NOT NULL,
        "status" "public"."notification_status_enum" NOT NULL DEFAULT 'PENDING',
        "error_message" text,
        "delivered_at" TIMESTAMP WITH TIME ZONE,
        "opened_at" TIMESTAMP WITH TIME ZONE,
        "clicked_at" TIMESTAMP WITH TIME ZONE,
        "metadata" jsonb,
        CONSTRAINT "PK_email_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_email_logs_notification_id" ON "email_logs" ("notification_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_email_logs_created_at" ON "email_logs" ("created_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_logs" ADD CONSTRAINT "FK_email_logs_notification_id" FOREIGN KEY ("notification_id") REFERENCES "email_notifications"("id") ON DELETE SET NULL`,
    );

    // email_campaigns
    await queryRunner.query(`
      CREATE TABLE "email_campaigns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "name" character varying(255) NOT NULL,
        "subject" character varying(500) NOT NULL,
        "body" text NOT NULL,
        "type" "public"."campaign_type_enum" NOT NULL DEFAULT 'PROMOTIONAL',
        "target_audience" jsonb,
        "status" "public"."campaign_status_enum" NOT NULL DEFAULT 'DRAFT',
        "scheduled_at" TIMESTAMP WITH TIME ZONE,
        "sent_at" TIMESTAMP WITH TIME ZONE,
        "total_recipients" integer NOT NULL DEFAULT 0,
        "successful_sends" integer NOT NULL DEFAULT 0,
        "failed_sends" integer NOT NULL DEFAULT 0,
        "opens_count" integer NOT NULL DEFAULT 0,
        "clicks_count" integer NOT NULL DEFAULT 0,
        "created_by" uuid,
        CONSTRAINT "PK_email_campaigns" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_email_campaigns_status" ON "email_campaigns" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_email_campaigns_scheduled_at" ON "email_campaigns" ("scheduled_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_email_campaigns_created_at" ON "email_campaigns" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_email_campaigns_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_email_campaigns_scheduled_at"`);
    await queryRunner.query(`DROP INDEX "idx_email_campaigns_status"`);
    await queryRunner.query(`DROP TABLE "email_campaigns"`);

    await queryRunner.query(
      `ALTER TABLE "email_logs" DROP CONSTRAINT "FK_email_logs_notification_id"`,
    );
    await queryRunner.query(`DROP INDEX "idx_email_logs_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_email_logs_notification_id"`);
    await queryRunner.query(`DROP TABLE "email_logs"`);

    await queryRunner.query(
      `ALTER TABLE "email_notifications" DROP CONSTRAINT "FK_email_notifications_template_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_notifications" DROP CONSTRAINT "FK_email_notifications_user_id"`,
    );
    await queryRunner.query(`DROP INDEX "idx_email_notifications_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_email_notifications_status"`);
    await queryRunner.query(`DROP INDEX "idx_email_notifications_user_id"`);
    await queryRunner.query(`DROP TABLE "email_notifications"`);

    await queryRunner.query(
      `ALTER TABLE "email_preferences" DROP CONSTRAINT "FK_email_preferences_user_id"`,
    );
    await queryRunner.query(`DROP INDEX "idx_email_preferences_user_id"`);
    await queryRunner.query(`DROP TABLE "email_preferences"`);

    await queryRunner.query(
      `DROP INDEX "idx_email_notification_templates_code"`,
    );
    await queryRunner.query(`DROP TABLE "email_notification_templates"`);

    await queryRunner.query(`DROP TYPE "public"."campaign_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."campaign_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."transactional_email_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notification_status_enum"`);
  }
}
