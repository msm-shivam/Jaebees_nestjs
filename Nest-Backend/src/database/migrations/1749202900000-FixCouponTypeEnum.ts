import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCouponTypeEnum1749202900000 implements MigrationInterface {
  name = 'FixCouponTypeEnum1749202900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The existing coupons_type_enum has wrong values (GENERAL, FIRST_ORDER, CATEGORY, PRODUCT)
    // Need to replace with PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING
    await queryRunner.query(`
      ALTER TABLE "coupons" ALTER COLUMN "type" TYPE text
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."coupons_type_enum"
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."coupons_type_enum" AS ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING')
    `);
    await queryRunner.query(`
      ALTER TABLE "coupons" ALTER COLUMN "type" TYPE "public"."coupons_type_enum" USING "type"::"public"."coupons_type_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "coupons" ALTER COLUMN "type" TYPE text
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."coupons_type_enum"
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."coupons_type_enum" AS ENUM('GENERAL', 'FIRST_ORDER', 'CATEGORY', 'PRODUCT')
    `);
    await queryRunner.query(`
      ALTER TABLE "coupons" ALTER COLUMN "type" TYPE "public"."coupons_type_enum" USING "type"::"public"."coupons_type_enum"
    `);
  }
}
