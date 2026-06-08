import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFoundationTables1749200000000 implements MigrationInterface {
  name = 'CreateFoundationTables1749200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── OTP Type Enum ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "public"."otp_type_enum" AS ENUM ('EMAIL_VERIFY', 'FORGOT_PASSWORD')
    `);

    // ─── users ──────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"                UUID          NOT NULL DEFAULT gen_random_uuid(),
        "first_name"        VARCHAR(100)  NOT NULL,
        "last_name"         VARCHAR(100)  NOT NULL,
        "email"             VARCHAR(255)  NOT NULL,
        "mobile"            VARCHAR(20),
        "password_hash"     VARCHAR(255)  NOT NULL,
        "is_email_verified" BOOLEAN       NOT NULL DEFAULT false,
        "is_active"         BOOLEAN       NOT NULL DEFAULT true,
        "created_at"        TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at"        TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email"  UNIQUE ("email"),
        CONSTRAINT "UQ_users_mobile" UNIQUE ("mobile")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_users_email"  ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_mobile" ON "users" ("mobile")`,
    );

    // ─── user_sessions ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "user_sessions" (
        "id"            UUID          NOT NULL DEFAULT gen_random_uuid(),
        "user_id"       UUID          NOT NULL,
        "refresh_token" VARCHAR(500)  NOT NULL,
        "ip_address"    VARCHAR(50),
        "user_agent"    VARCHAR(500),
        "expires_at"    TIMESTAMPTZ   NOT NULL,
        "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_sessions_user" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_user_sessions_user_id" ON "user_sessions" ("user_id")`,
    );

    // ─── roles ───────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
        "name"        VARCHAR(100) NOT NULL,
        "slug"        VARCHAR(100) NOT NULL,
        "description" TEXT,
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_roles_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_roles_slug" ON "roles" ("slug")`,
    );

    // ─── permissions ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id"         UUID         NOT NULL DEFAULT gen_random_uuid(),
        "name"       VARCHAR(100) NOT NULL,
        "slug"       VARCHAR(100) NOT NULL,
        "module"     VARCHAR(100) NOT NULL,
        "created_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_permissions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_permissions_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_permissions_slug" ON "permissions" ("slug")`,
    );

    // ─── role_permissions ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id"       UUID NOT NULL,
        "permission_id" UUID NOT NULL,
        CONSTRAINT "PK_role_permissions"   PRIMARY KEY ("role_id", "permission_id"),
        CONSTRAINT "FK_rp_role"       FOREIGN KEY ("role_id")
          REFERENCES "roles"       ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_rp_permission" FOREIGN KEY ("permission_id")
          REFERENCES "permissions" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_role_permissions_role_id"       ON "role_permissions" ("role_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_role_permissions_permission_id" ON "role_permissions" ("permission_id")`,
    );

    // ─── admin_users ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "admin_users" (
        "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
        "name"          VARCHAR(200) NOT NULL,
        "email"         VARCHAR(255) NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "is_active"     BOOLEAN      NOT NULL DEFAULT true,
        "last_login_at" TIMESTAMPTZ,
        "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_users"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_admin_users_email" UNIQUE ("email")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_admin_users_email" ON "admin_users" ("email")`,
    );

    // ─── admin_roles ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "admin_roles" (
        "admin_id" UUID NOT NULL,
        "role_id"  UUID NOT NULL,
        CONSTRAINT "PK_admin_roles"      PRIMARY KEY ("admin_id", "role_id"),
        CONSTRAINT "FK_ar_admin" FOREIGN KEY ("admin_id")
          REFERENCES "admin_users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ar_role"  FOREIGN KEY ("role_id")
          REFERENCES "roles"     ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_admin_roles_admin_id" ON "admin_roles" ("admin_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_admin_roles_role_id"  ON "admin_roles" ("role_id")`,
    );

    // ─── admin_sessions ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "admin_sessions" (
        "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
        "admin_id"      UUID         NOT NULL,
        "refresh_token" VARCHAR(500) NOT NULL,
        "ip_address"    VARCHAR(50),
        "user_agent"    VARCHAR(500),
        "expires_at"    TIMESTAMPTZ  NOT NULL,
        "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_admin_sessions_admin" FOREIGN KEY ("admin_id")
          REFERENCES "admin_users" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_admin_sessions_admin_id" ON "admin_sessions" ("admin_id")`,
    );

    // ─── otp_verifications ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "otp_verifications" (
        "id"          UUID            NOT NULL DEFAULT gen_random_uuid(),
        "email"       VARCHAR(255)    NOT NULL,
        "otp"         VARCHAR(10)     NOT NULL,
        "type"        "otp_type_enum" NOT NULL,
        "expires_at"  TIMESTAMPTZ     NOT NULL,
        "verified_at" TIMESTAMPTZ,
        "created_at"  TIMESTAMPTZ     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_otp_verifications" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_otp_email_type" ON "otp_verifications" ("email", "type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "otp_verifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admin_sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admin_roles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admin_users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."otp_type_enum"`);
  }
}
