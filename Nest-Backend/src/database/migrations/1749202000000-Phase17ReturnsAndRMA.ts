import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase17ReturnsAndRMA1749202000000 implements MigrationInterface {
  name = 'Phase17ReturnsAndRMA1749202000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create return_sequence_counters table
    await queryRunner.query(`
      CREATE TABLE "return_sequence_counters" (
        "locked" integer NOT NULL DEFAULT 1,
        "last_number" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_return_sequence_counters_locked" PRIMARY KEY ("locked"),
        CONSTRAINT "CK_return_sequence_counters_locked" CHECK (locked = 1)
      )
    `);
    await queryRunner.query(`INSERT INTO return_sequence_counters (locked, last_number) VALUES (1, 0)`);

    // Create return_requests table
    await queryRunner.query(`
      CREATE TYPE "public"."return_request_status_enum" AS ENUM (
        'REQUESTED', 'APPROVED', 'REJECTED', 'PICKUP_SCHEDULED',
        'IN_TRANSIT', 'RECEIVED', 'REFUNDED', 'COMPLETED'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."return_reason_enum" AS ENUM (
        'WRONG_SIZE', 'DAMAGED', 'DEFECTIVE', 'WRONG_ITEM', 'QUALITY_ISSUE', 'OTHER'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."return_item_condition_enum" AS ENUM (
        'UNOPENED', 'OPENED', 'DAMAGED'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."reverse_shipment_status_enum" AS ENUM (
        'PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "return_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "return_number" character varying(50) NOT NULL,
        "order_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "status" "public"."return_request_status_enum" NOT NULL DEFAULT 'REQUESTED',
        "reason" "public"."return_reason_enum" NOT NULL,
        "notes" text,
        "total_refund_amount" numeric(12,2) NOT NULL DEFAULT 0,
        "requested_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "approved_at" TIMESTAMP WITH TIME ZONE,
        "completed_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_return_requests" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_return_requests_return_number" ON "return_requests" ("return_number")`);
    await queryRunner.query(`CREATE INDEX "idx_return_requests_order_id" ON "return_requests" ("order_id")`);
    await queryRunner.query(`CREATE INDEX "idx_return_requests_user_id" ON "return_requests" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_return_requests_status" ON "return_requests" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_return_requests_requested_at" ON "return_requests" ("requested_at")`);
    await queryRunner.query(`ALTER TABLE "return_requests" ADD CONSTRAINT "FK_return_requests_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "return_requests" ADD CONSTRAINT "FK_return_requests_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`);

    // Create return_items table
    await queryRunner.query(`
      CREATE TABLE "return_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "return_request_id" uuid NOT NULL,
        "order_item_id" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "reason" text,
        "condition" "public"."return_item_condition_enum" NOT NULL DEFAULT 'UNOPENED',
        "refund_amount" numeric(12,2) NOT NULL DEFAULT 0,
        CONSTRAINT "PK_return_items" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_return_items_return_request_id" ON "return_items" ("return_request_id")`);
    await queryRunner.query(`CREATE INDEX "idx_return_items_order_item_id" ON "return_items" ("order_item_id")`);
    await queryRunner.query(`ALTER TABLE "return_items" ADD CONSTRAINT "FK_return_items_return_request_id" FOREIGN KEY ("return_request_id") REFERENCES "return_requests"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "return_items" ADD CONSTRAINT "FK_return_items_order_item_id" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE`);

    // Create reverse_shipments table
    await queryRunner.query(`
      CREATE TABLE "reverse_shipments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "return_request_id" uuid NOT NULL,
        "courier_name" character varying(255),
        "tracking_number" character varying(255),
        "status" "public"."reverse_shipment_status_enum" NOT NULL DEFAULT 'PENDING',
        "pickup_date" TIMESTAMP WITH TIME ZONE,
        "delivered_date" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_reverse_shipments" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_reverse_shipments_return_request_id" ON "reverse_shipments" ("return_request_id")`);
    await queryRunner.query(`CREATE INDEX "idx_reverse_shipments_tracking_number" ON "reverse_shipments" ("tracking_number")`);
    await queryRunner.query(`ALTER TABLE "reverse_shipments" ADD CONSTRAINT "FK_reverse_shipments_return_request_id" FOREIGN KEY ("return_request_id") REFERENCES "return_requests"("id") ON DELETE CASCADE`);

    // Create return_audits table
    await queryRunner.query(`
      CREATE TABLE "return_audits" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "return_request_id" uuid NOT NULL,
        "action" character varying(100) NOT NULL,
        "performed_by" uuid,
        "notes" text,
        CONSTRAINT "PK_return_audits" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_return_audits_return_request_id" ON "return_audits" ("return_request_id")`);
    await queryRunner.query(`ALTER TABLE "return_audits" ADD CONSTRAINT "FK_return_audits_return_request_id" FOREIGN KEY ("return_request_id") REFERENCES "return_requests"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "return_audits" ADD CONSTRAINT "FK_return_audits_performed_by" FOREIGN KEY ("performed_by") REFERENCES "admin_users"("id") ON DELETE SET NULL`);

    // Create return_reason_master table
    await queryRunner.query(`
      CREATE TABLE "return_reason_master" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "code" character varying(50) NOT NULL,
        "title" character varying(255) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_return_reason_master" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_return_reason_master_code" ON "return_reason_master" ("code")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "return_reason_master"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "return_audits"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reverse_shipments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "return_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "return_requests"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."reverse_shipment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."return_item_condition_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."return_reason_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."return_request_status_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "return_sequence_counters"`);
  }
}
