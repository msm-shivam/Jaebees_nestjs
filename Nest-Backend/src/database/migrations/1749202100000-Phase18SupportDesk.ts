import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase18SupportDesk1749202100000 implements MigrationInterface {
  name = 'Phase18SupportDesk1749202100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ticket_sequence_counters" (
        "locked" integer NOT NULL DEFAULT 1,
        "last_number" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_ticket_sequence_counters_locked" PRIMARY KEY ("locked"),
        CONSTRAINT "CK_ticket_sequence_counters_locked" CHECK (locked = 1)
      )
    `);
    await queryRunner.query(
      `INSERT INTO ticket_sequence_counters (locked, last_number) VALUES (1, 0)`,
    );

    await queryRunner.query(`
      CREATE TYPE "public"."ticket_status_enum" AS ENUM (
        'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."ticket_category_enum" AS ENUM (
        'ORDER_ISSUE', 'PAYMENT_ISSUE', 'SHIPPING_ISSUE', 'RETURN_ISSUE',
        'REFUND_ISSUE', 'PRODUCT_ISSUE', 'ACCOUNT_ISSUE', 'OTHER'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."ticket_priority_enum" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."sender_type_enum" AS ENUM ('CUSTOMER', 'ADMIN')
    `);

    // support_tickets
    await queryRunner.query(`
      CREATE TABLE "support_tickets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "ticket_number" character varying(50) NOT NULL,
        "customer_id" uuid NOT NULL,
        "order_id" uuid,
        "subject" character varying(255) NOT NULL,
        "category" "public"."ticket_category_enum" NOT NULL,
        "priority" "public"."ticket_priority_enum" NOT NULL DEFAULT 'MEDIUM',
        "status" "public"."ticket_status_enum" NOT NULL DEFAULT 'OPEN',
        "assigned_to" uuid,
        "first_response_at" TIMESTAMP WITH TIME ZONE,
        "resolved_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_support_tickets" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_support_tickets_ticket_number" ON "support_tickets" ("ticket_number")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_support_tickets_customer_id" ON "support_tickets" ("customer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_support_tickets_status" ON "support_tickets" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_support_tickets_priority" ON "support_tickets" ("priority")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_support_tickets_assigned_to" ON "support_tickets" ("assigned_to")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_support_tickets_created_at" ON "support_tickets" ("created_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_tickets" ADD CONSTRAINT "FK_support_tickets_customer_id" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_tickets" ADD CONSTRAINT "FK_support_tickets_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_tickets" ADD CONSTRAINT "FK_support_tickets_assigned_to" FOREIGN KEY ("assigned_to") REFERENCES "admin_users"("id") ON DELETE SET NULL`,
    );

    // ticket_messages
    await queryRunner.query(`
      CREATE TABLE "ticket_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "ticket_id" uuid NOT NULL,
        "sender_id" uuid NOT NULL,
        "sender_type" "public"."sender_type_enum" NOT NULL,
        "message" text NOT NULL,
        CONSTRAINT "PK_ticket_messages" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ticket_messages_ticket_id" ON "ticket_messages" ("ticket_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ticket_messages_created_at" ON "ticket_messages" ("created_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_messages" ADD CONSTRAINT "FK_ticket_messages_ticket_id" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE`,
    );

    // ticket_assignments
    await queryRunner.query(`
      CREATE TABLE "ticket_assignments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "ticket_id" uuid NOT NULL,
        "assigned_to" uuid NOT NULL,
        "assigned_by" uuid NOT NULL,
        CONSTRAINT "PK_ticket_assignments" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ticket_assignments_ticket_id" ON "ticket_assignments" ("ticket_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_assignments" ADD CONSTRAINT "FK_ticket_assignments_ticket_id" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_assignments" ADD CONSTRAINT "FK_ticket_assignments_assigned_to" FOREIGN KEY ("assigned_to") REFERENCES "admin_users"("id") ON DELETE CASCADE`,
    );

    // ticket_notes
    await queryRunner.query(`
      CREATE TABLE "ticket_notes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "ticket_id" uuid NOT NULL,
        "note" text NOT NULL,
        "created_by" uuid NOT NULL,
        CONSTRAINT "PK_ticket_notes" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ticket_notes_ticket_id" ON "ticket_notes" ("ticket_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_notes" ADD CONSTRAINT "FK_ticket_notes_ticket_id" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_notes" ADD CONSTRAINT "FK_ticket_notes_created_by" FOREIGN KEY ("created_by") REFERENCES "admin_users"("id") ON DELETE CASCADE`,
    );

    // ticket_sla_logs
    await queryRunner.query(`
      CREATE TABLE "ticket_sla_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "ticket_id" uuid NOT NULL,
        "first_response_at" TIMESTAMP WITH TIME ZONE,
        "resolved_at" TIMESTAMP WITH TIME ZONE,
        "response_minutes" integer,
        "resolution_minutes" integer,
        CONSTRAINT "PK_ticket_sla_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ticket_sla_logs_ticket_id" ON "ticket_sla_logs" ("ticket_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_sla_logs" ADD CONSTRAINT "FK_ticket_sla_logs_ticket_id" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "ticket_sla_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ticket_notes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ticket_assignments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ticket_messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "support_tickets"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."sender_type_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."ticket_priority_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."ticket_category_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."ticket_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "ticket_sequence_counters"`);
  }
}
