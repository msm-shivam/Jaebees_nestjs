import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMobileVerificationAndAccountStatus1791865863926 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Enums if they do not exist
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "account_status_enum" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "otp_channel_enum" AS ENUM ('SMS', 'EMAIL');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "otp_purpose_enum" AS ENUM ('MOBILE_VERIFICATION', 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'CHANGE_MOBILE');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Add columns to users table
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "account_status" "account_status_enum" NOT NULL DEFAULT 'PENDING_VERIFICATION';
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_mobile_verified" boolean NOT NULL DEFAULT false;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mobile_verified_at" timestamptz;
    `);

    // 3. Backfill existing verified users as ACTIVE & mobile-verified
    await queryRunner.query(`
      UPDATE "users" SET "account_status" = 'ACTIVE', "is_mobile_verified" = true, "mobile_verified_at" = now() WHERE "is_email_verified" = true OR "account_status" = 'ACTIVE';
    `);

    // 4. Update otp_verifications table for incremental rollout
    await queryRunner.query(`
      ALTER TABLE "otp_verifications" ADD COLUMN IF NOT EXISTS "otp_hash" varchar(255);
      ALTER TABLE "otp_verifications" ADD COLUMN IF NOT EXISTS "mobile" varchar(20);
      ALTER TABLE "otp_verifications" ADD COLUMN IF NOT EXISTS "channel" "otp_channel_enum" NOT NULL DEFAULT 'SMS';
      ALTER TABLE "otp_verifications" ADD COLUMN IF NOT EXISTS "purpose" "otp_purpose_enum" NOT NULL DEFAULT 'MOBILE_VERIFICATION';
      ALTER TABLE "otp_verifications" ADD COLUMN IF NOT EXISTS "attempts" integer NOT NULL DEFAULT 0;
      ALTER TABLE "otp_verifications" ALTER COLUMN "email" DROP NOT NULL;
      ALTER TABLE "otp_verifications" ALTER COLUMN "otp" DROP NOT NULL;
      ALTER TABLE "otp_verifications" ALTER COLUMN "type" DROP NOT NULL;

      CREATE INDEX IF NOT EXISTS "IDX_otp_mobile_purpose" ON "otp_verifications" ("mobile", "purpose");
      CREATE INDEX IF NOT EXISTS "IDX_otp_email_purpose" ON "otp_verifications" ("email", "purpose");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_otp_email_purpose";
      DROP INDEX IF EXISTS "IDX_otp_mobile_purpose";
      ALTER TABLE "otp_verifications" DROP COLUMN IF EXISTS "attempts";
      ALTER TABLE "otp_verifications" DROP COLUMN IF EXISTS "purpose";
      ALTER TABLE "otp_verifications" DROP COLUMN IF EXISTS "channel";
      ALTER TABLE "otp_verifications" DROP COLUMN IF EXISTS "mobile";
      ALTER TABLE "otp_verifications" DROP COLUMN IF EXISTS "otp_hash";
      ALTER TABLE "otp_verifications" ALTER COLUMN "email" SET NOT NULL;

      ALTER TABLE "users" DROP COLUMN IF EXISTS "mobile_verified_at";
      ALTER TABLE "users" DROP COLUMN IF EXISTS "is_mobile_verified";
      ALTER TABLE "users" DROP COLUMN IF EXISTS "account_status";

      DROP TYPE IF EXISTS "otp_purpose_enum";
      DROP TYPE IF EXISTS "otp_channel_enum";
      DROP TYPE IF EXISTS "account_status_enum";
    `);
  }
}
