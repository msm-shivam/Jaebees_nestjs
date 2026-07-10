import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFcmTokens1791865863924 implements MigrationInterface {
  name = 'CreateFcmTokens1791865863924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."fcm_tokens_user_type_enum" AS ENUM ('customer', 'admin')
    `);
    await queryRunner.query(`
      CREATE TABLE "fcm_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        "user_type" "public"."fcm_tokens_user_type_enum" NOT NULL,
        "token" character varying(500) NOT NULL,
        "device_info" jsonb,
        CONSTRAINT "PK_fcm_tokens_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_fcm_tokens_token" UNIQUE ("token")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_fcm_tokens_user" ON "fcm_tokens" ("user_id", "user_type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "fcm_tokens"`);
    await queryRunner.query(`DROP TYPE "public"."fcm_tokens_user_type_enum"`);
  }
}
