import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDispatchedAndShippedEnums1791865863930 implements MigrationInterface {
  name = 'AddDispatchedAndShippedEnums1791865863930';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."orders_status_enum" ADD VALUE IF NOT EXISTS 'DISPATCHED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."shipments_status_enum" ADD VALUE IF NOT EXISTS 'SHIPPED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."shipment_tracking_logs_status_enum" ADD VALUE IF NOT EXISTS 'SHIPPED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."shipment_tracking_logs_status_enum" ADD VALUE IF NOT EXISTS 'DISPATCHED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing values from ENUM types easily
  }
}
