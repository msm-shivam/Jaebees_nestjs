import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase16Part2InventoryImprovements1749201900000 implements MigrationInterface {
  name = 'Phase16Part2InventoryImprovements1749201900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create PO sequence counter table
    await queryRunner.query(`
      CREATE TABLE "po_sequence_counters" (
        "year" integer NOT NULL,
        "last_number" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_po_sequence_counters_year" PRIMARY KEY ("year")
      )
    `);

    // Create GRN sequence counter table (single-row table with locked=1)
    await queryRunner.query(`
      CREATE TABLE "grn_sequence_counters" (
        "locked" integer NOT NULL DEFAULT 1,
        "last_number" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_grn_sequence_counters_locked" PRIMARY KEY ("locked"),
        CONSTRAINT "CK_grn_sequence_counters_locked" CHECK (locked = 1)
      )
    `);
    await queryRunner.query(`INSERT INTO grn_sequence_counters (locked, last_number) VALUES (1, 0)`);

    // Seed current year PO counter
    await queryRunner.query(`INSERT INTO po_sequence_counters (year, last_number) VALUES (2026, 0) ON CONFLICT DO NOTHING`);
    await queryRunner.query(`INSERT INTO po_sequence_counters (year, last_number) VALUES (2025, 0) ON CONFLICT DO NOTHING`);

    // Add reorder columns to inventories table
    await queryRunner.query(`ALTER TABLE "inventories" ADD COLUMN "reorder_point" integer NOT NULL DEFAULT 10`);
    await queryRunner.query(`ALTER TABLE "inventories" ADD COLUMN "reorder_quantity" integer NOT NULL DEFAULT 50`);
    await queryRunner.query(`CREATE INDEX "idx_inventories_reorder_point" ON "inventories" ("reorder_point")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventories_reorder_point"`);
    await queryRunner.query(`ALTER TABLE "inventories" DROP COLUMN IF EXISTS "reorder_quantity"`);
    await queryRunner.query(`ALTER TABLE "inventories" DROP COLUMN IF EXISTS "reorder_point"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "grn_sequence_counters"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "po_sequence_counters"`);
  }
}
