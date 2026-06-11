import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase20FinanceAccounting1749202400000 implements MigrationInterface {
  name = 'Phase20FinanceAccounting1749202400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Sequence counters
    await queryRunner.query(`
      CREATE TABLE "finance_sequence_counters" (
        "locked" integer NOT NULL DEFAULT 1,
        "last_number" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_finance_sequence_counters_locked" PRIMARY KEY ("locked"),
        CONSTRAINT "CK_finance_sequence_counters_locked" CHECK (locked = 1)
      )
    `);
    await queryRunner.query(`INSERT INTO finance_sequence_counters (locked, last_number) VALUES (1, 0)`);

    await queryRunner.query(`
      CREATE TABLE "settlement_sequence_counters" (
        "locked" integer NOT NULL DEFAULT 1,
        "last_number" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_settlement_sequence_counters_locked" PRIMARY KEY ("locked"),
        CONSTRAINT "CK_settlement_sequence_counters_locked" CHECK (locked = 1)
      )
    `);
    await queryRunner.query(`INSERT INTO settlement_sequence_counters (locked, last_number) VALUES (1, 0)`);

    // Enums
    await queryRunner.query(`
      CREATE TYPE "public"."transaction_type_enum" AS ENUM (
        'ORDER_PAYMENT', 'REFUND', 'COUPON_DISCOUNT', 'SHIPPING_CHARGE',
        'TAX_COLLECTION', 'SUPPLIER_PAYMENT', 'EXPENSE', 'ADJUSTMENT'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."settlement_status_enum" AS ENUM (
        'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'
      )
    `);

    // financial_transactions
    await queryRunner.query(`
      CREATE TABLE "financial_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "transaction_number" character varying(50) NOT NULL,
        "type" "public"."transaction_type_enum" NOT NULL,
        "amount" numeric(15,2) NOT NULL,
        "status" character varying(50) NOT NULL DEFAULT 'COMPLETED',
        "reference_type" character varying(100),
        "reference_id" uuid,
        "description" text,
        "transaction_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_financial_transactions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_financial_transactions_number" ON "financial_transactions" ("transaction_number")`);
    await queryRunner.query(`CREATE INDEX "idx_financial_transactions_type" ON "financial_transactions" ("type")`);
    await queryRunner.query(`CREATE INDEX "idx_financial_transactions_reference" ON "financial_transactions" ("reference_type", "reference_id")`);
    await queryRunner.query(`CREATE INDEX "idx_financial_transactions_created_at" ON "financial_transactions" ("created_at")`);

    // ledger_entries
    await queryRunner.query(`
      CREATE TABLE "ledger_entries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "transaction_id" uuid NOT NULL,
        "account_code" character varying(50) NOT NULL,
        "account_name" character varying(255) NOT NULL,
        "debit_amount" numeric(15,2) NOT NULL DEFAULT 0,
        "credit_amount" numeric(15,2) NOT NULL DEFAULT 0,
        "balance_after" numeric(15,2),
        "description" text,
        "entry_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_ledger_entries" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_ledger_entries_transaction_id" ON "ledger_entries" ("transaction_id")`);
    await queryRunner.query(`CREATE INDEX "idx_ledger_entries_account_code" ON "ledger_entries" ("account_code")`);
    await queryRunner.query(`CREATE INDEX "idx_ledger_entries_created_at" ON "ledger_entries" ("created_at")`);
    await queryRunner.query(`ALTER TABLE "ledger_entries" ADD CONSTRAINT "FK_ledger_entries_transaction_id" FOREIGN KEY ("transaction_id") REFERENCES "financial_transactions"("id") ON DELETE CASCADE`);

    // settlements
    await queryRunner.query(`
      CREATE TABLE "settlements" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "settlement_number" character varying(50) NOT NULL,
        "supplier_id" uuid,
        "amount" numeric(15,2) NOT NULL,
        "status" "public"."settlement_status_enum" NOT NULL DEFAULT 'PENDING',
        "settlement_date" TIMESTAMP WITH TIME ZONE,
        "due_date" TIMESTAMP WITH TIME ZONE,
        "description" text,
        "reference_type" character varying(100),
        "reference_id" uuid,
        CONSTRAINT "PK_settlements" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_settlements_number" ON "settlements" ("settlement_number")`);
    await queryRunner.query(`CREATE INDEX "idx_settlements_supplier_id" ON "settlements" ("supplier_id")`);
    await queryRunner.query(`CREATE INDEX "idx_settlements_status" ON "settlements" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_settlements_created_at" ON "settlements" ("created_at")`);

    // tax_records
    await queryRunner.query(`
      CREATE TABLE "tax_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "order_id" uuid,
        "taxable_amount" numeric(15,2) NOT NULL,
        "tax_amount" numeric(15,2) NOT NULL,
        "tax_rate" numeric(5,2) NOT NULL,
        "tax_type" character varying(50) NOT NULL,
        "tax_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_tax_records" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_tax_records_order_id" ON "tax_records" ("order_id")`);
    await queryRunner.query(`CREATE INDEX "idx_tax_records_tax_type" ON "tax_records" ("tax_type")`);
    await queryRunner.query(`CREATE INDEX "idx_tax_records_created_at" ON "tax_records" ("created_at")`);
    await queryRunner.query(`ALTER TABLE "tax_records" ADD CONSTRAINT "FK_tax_records_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL`);

    // expense_records
    await queryRunner.query(`
      CREATE TABLE "expense_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "category" character varying(100) NOT NULL,
        "amount" numeric(15,2) NOT NULL,
        "expense_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "description" text,
        "vendor_name" character varying(255),
        "invoice_number" character varying(100),
        "created_by" uuid,
        CONSTRAINT "PK_expense_records" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_expense_records_category" ON "expense_records" ("category")`);
    await queryRunner.query(`CREATE INDEX "idx_expense_records_expense_date" ON "expense_records" ("expense_date")`);
    await queryRunner.query(`CREATE INDEX "idx_expense_records_created_at" ON "expense_records" ("created_at")`);

    // financial_audits
    await queryRunner.query(`
      CREATE TABLE "financial_audits" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "action_type" character varying(100) NOT NULL,
        "entity_type" character varying(100) NOT NULL,
        "entity_id" uuid,
        "performed_by" uuid,
        "details" jsonb,
        "notes" text,
        CONSTRAINT "PK_financial_audits" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_financial_audits_entity" ON "financial_audits" ("entity_type", "entity_id")`);
    await queryRunner.query(`CREATE INDEX "idx_financial_audits_created_at" ON "financial_audits" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_financial_audits_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_financial_audits_entity"`);
    await queryRunner.query(`DROP TABLE "financial_audits"`);

    await queryRunner.query(`DROP INDEX "idx_expense_records_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_expense_records_expense_date"`);
    await queryRunner.query(`DROP INDEX "idx_expense_records_category"`);
    await queryRunner.query(`DROP TABLE "expense_records"`);

    await queryRunner.query(`ALTER TABLE "tax_records" DROP CONSTRAINT "FK_tax_records_order_id"`);
    await queryRunner.query(`DROP INDEX "idx_tax_records_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_tax_records_tax_type"`);
    await queryRunner.query(`DROP INDEX "idx_tax_records_order_id"`);
    await queryRunner.query(`DROP TABLE "tax_records"`);

    await queryRunner.query(`DROP INDEX "idx_settlements_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_settlements_status"`);
    await queryRunner.query(`DROP INDEX "idx_settlements_supplier_id"`);
    await queryRunner.query(`DROP INDEX "idx_settlements_number"`);
    await queryRunner.query(`DROP TABLE "settlements"`);

    await queryRunner.query(`ALTER TABLE "ledger_entries" DROP CONSTRAINT "FK_ledger_entries_transaction_id"`);
    await queryRunner.query(`DROP INDEX "idx_ledger_entries_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_ledger_entries_account_code"`);
    await queryRunner.query(`DROP INDEX "idx_ledger_entries_transaction_id"`);
    await queryRunner.query(`DROP TABLE "ledger_entries"`);

    await queryRunner.query(`DROP INDEX "idx_financial_transactions_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_financial_transactions_reference"`);
    await queryRunner.query(`DROP INDEX "idx_financial_transactions_type"`);
    await queryRunner.query(`DROP INDEX "idx_financial_transactions_number"`);
    await queryRunner.query(`DROP TABLE "financial_transactions"`);

    await queryRunner.query(`DROP TYPE "public"."settlement_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_type_enum"`);

    await queryRunner.query(`DROP TABLE "settlement_sequence_counters"`);
    await queryRunner.query(`DROP TABLE "finance_sequence_counters"`);
  }
}
