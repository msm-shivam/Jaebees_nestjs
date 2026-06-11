import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase16InventoryManagement1749201800000 implements MigrationInterface {
  name = 'Phase16InventoryManagement1749201800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create purchase_order_status enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."purchase_order_status_enum" AS ENUM('DRAFT', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // Create audit_action_type enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."inventory_audits_action_type_enum" AS ENUM('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'RESERVATION', 'RELEASE', 'GOODS_RECEIPT', 'MANUAL_ADJUST');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // Create suppliers table
    await queryRunner.query(`
      CREATE TABLE "suppliers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(50) NOT NULL,
        "name" character varying(200) NOT NULL,
        "contact_person" character varying(200),
        "email" character varying(255),
        "phone" character varying(50),
        "address" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "payment_terms" character varying(200),
        "lead_time_days" integer,
        "notes" text,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_suppliers_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_suppliers_code" UNIQUE ("code")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_suppliers_active" ON "suppliers" ("is_active")`);

    // Create purchase_orders table
    await queryRunner.query(`
      CREATE TABLE "purchase_orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "po_number" character varying(50) NOT NULL,
        "supplier_id" uuid NOT NULL,
        "status" "public"."purchase_order_status_enum" NOT NULL DEFAULT 'DRAFT',
        "total_amount" decimal(12,2) NOT NULL DEFAULT '0',
        "expected_date" TIMESTAMP WITH TIME ZONE,
        "notes" text,
        "ordered_by" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_purchase_orders_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_purchase_orders_po_number" UNIQUE ("po_number"),
        CONSTRAINT "FK_purchase_orders_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_purchase_orders_supplier" ON "purchase_orders" ("supplier_id")`);
    await queryRunner.query(`CREATE INDEX "idx_purchase_orders_status" ON "purchase_orders" ("status")`);

    // Create purchase_order_items table
    await queryRunner.query(`
      CREATE TABLE "purchase_order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "purchase_order_id" uuid NOT NULL,
        "variant_id" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "received_quantity" integer NOT NULL DEFAULT 0,
        "cost_price" decimal(12,2) NOT NULL,
        "line_total" decimal(12,2) NOT NULL DEFAULT '0',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_purchase_order_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_purchase_order_items_order" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_purchase_order_items_order" ON "purchase_order_items" ("purchase_order_id")`);
    await queryRunner.query(`CREATE INDEX "idx_purchase_order_items_variant" ON "purchase_order_items" ("variant_id")`);

    // Create goods_receipts table
    await queryRunner.query(`
      CREATE TABLE "goods_receipts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "receipt_number" character varying(50) NOT NULL,
        "purchase_order_id" uuid NOT NULL,
        "received_by" character varying(200),
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_goods_receipts_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_goods_receipts_receipt_number" UNIQUE ("receipt_number"),
        CONSTRAINT "FK_goods_receipts_purchase_order" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_goods_receipts_purchase_order" ON "goods_receipts" ("purchase_order_id")`);

    // Create goods_receipt_items table
    await queryRunner.query(`
      CREATE TABLE "goods_receipt_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "receipt_id" uuid NOT NULL,
        "variant_id" uuid NOT NULL,
        "quantity_received" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_goods_receipt_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_goods_receipt_items_receipt" FOREIGN KEY ("receipt_id") REFERENCES "goods_receipts"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_goods_receipt_items_receipt" ON "goods_receipt_items" ("receipt_id")`);
    await queryRunner.query(`CREATE INDEX "idx_goods_receipt_items_variant" ON "goods_receipt_items" ("variant_id")`);

    // Create stock_adjustments table
    await queryRunner.query(`
      CREATE TABLE "stock_adjustments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "variant_id" uuid NOT NULL,
        "previous_quantity" integer NOT NULL,
        "new_quantity" integer NOT NULL,
        "reason" text,
        "adjusted_by" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stock_adjustments_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_stock_adjustments_variant" ON "stock_adjustments" ("variant_id")`);

    // Create stock_alerts table
    await queryRunner.query(`
      CREATE TABLE "stock_alerts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "variant_id" uuid NOT NULL,
        "alert_type" character varying(50) NOT NULL DEFAULT 'LOW_STOCK',
        "threshold_quantity" integer NOT NULL DEFAULT 0,
        "current_quantity" integer NOT NULL DEFAULT 0,
        "is_resolved" boolean NOT NULL DEFAULT false,
        "triggered_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "resolved_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stock_alerts_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_stock_alerts_variant" ON "stock_alerts" ("variant_id")`);
    await queryRunner.query(`CREATE INDEX "idx_stock_alerts_resolved" ON "stock_alerts" ("is_resolved")`);

    // Create inventory_audits table
    await queryRunner.query(`
      CREATE TABLE "inventory_audits" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "variant_id" uuid NOT NULL,
        "action_type" "public"."inventory_audits_action_type_enum" NOT NULL,
        "before_quantity" integer NOT NULL,
        "after_quantity" integer NOT NULL,
        "reference_type" character varying(100),
        "reference_id" uuid,
        "notes" text,
        "performed_by" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inventory_audits_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_inventory_audits_variant" ON "inventory_audits" ("variant_id")`);
    await queryRunner.query(`CREATE INDEX "idx_inventory_audits_action" ON "inventory_audits" ("action_type")`);
    await queryRunner.query(`CREATE INDEX "idx_inventory_audits_created" ON "inventory_audits" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_audits" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_alerts" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_adjustments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "goods_receipt_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "goods_receipts" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "purchase_order_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "purchase_orders" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "suppliers" CASCADE`);

    await queryRunner.query(`DROP TYPE IF EXISTS "public"."inventory_audits_action_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."purchase_order_status_enum"`);
  }
}
