import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefundReservationFields1791865863929 implements MigrationInterface {
  name = 'AddRefundReservationFields1791865863929';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_refunds" ADD COLUMN IF NOT EXISTS "status" varchar(50) NOT NULL DEFAULT 'COMPLETED'`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_refunds" ADD COLUMN IF NOT EXISTS "idempotency_key" varchar(255)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payment_refunds_idempotency_key" ON "payment_refunds" ("idempotency_key") WHERE "idempotency_key" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_payment_refunds_idempotency_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_refunds" DROP COLUMN IF EXISTS "idempotency_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_refunds" DROP COLUMN IF EXISTS "status"`,
    );
  }
}
