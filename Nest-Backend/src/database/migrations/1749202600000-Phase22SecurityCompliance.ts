import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase22SecurityCompliance1749202600000 implements MigrationInterface {
  name = 'Phase22SecurityCompliance1749202600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."security_event_type_enum" AS ENUM (
        'LOGIN_SUCCESS', 'LOGIN_FAILED', 'ACCOUNT_LOCKED', 'PASSWORD_CHANGED',
        'PASSWORD_RESET', 'SESSION_REVOKED', 'PERMISSION_CHANGED',
        'ROLE_CHANGED', 'SUSPICIOUS_ACTIVITY', 'ACCOUNT_DELETED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."severity_level_enum" AS ENUM (
        'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."privacy_request_type_enum" AS ENUM (
        'EXPORT_DATA', 'DELETE_ACCOUNT'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."privacy_request_status_enum" AS ENUM (
        'PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."consent_type_enum" AS ENUM (
        'MARKETING', 'DATA_PROCESSING', 'COOKIES', 'THIRD_PARTY'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "user_id" uuid,
        "action" character varying(100) NOT NULL,
        "entity_type" character varying(100) NOT NULL,
        "entity_id" uuid,
        "old_values" jsonb,
        "new_values" jsonb,
        "ip_address" character varying(50),
        "user_agent" character varying(500),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_logs_action" ON "audit_logs" ("action")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_logs_entity" ON "audit_logs" ("entity_type", "entity_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" ("created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "login_activities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "user_id" uuid,
        "email" character varying(255) NOT NULL,
        "ip_address" character varying(50),
        "user_agent" character varying(500),
        "status" character varying(50) NOT NULL,
        "login_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_login_activities" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_login_activities_user_id" ON "login_activities" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_login_activities_status" ON "login_activities" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_login_activities_login_at" ON "login_activities" ("login_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_login_activities_created_at" ON "login_activities" ("created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "security_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "user_id" uuid NOT NULL,
        "token_id" uuid NOT NULL,
        "ip_address" character varying(50),
        "user_agent" character varying(500),
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "revoked_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_security_sessions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_security_sessions_user_id" ON "security_sessions" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_security_sessions_token_id" ON "security_sessions" ("token_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_security_sessions_created_at" ON "security_sessions" ("created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "security_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "event_type" "public"."security_event_type_enum" NOT NULL,
        "severity" "public"."severity_level_enum" NOT NULL DEFAULT 'LOW',
        "user_id" uuid,
        "details" jsonb,
        CONSTRAINT "PK_security_events" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_security_events_event_type" ON "security_events" ("event_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_security_events_severity" ON "security_events" ("severity")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_security_events_user_id" ON "security_events" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_security_events_created_at" ON "security_events" ("created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "privacy_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "user_id" uuid NOT NULL,
        "request_type" "public"."privacy_request_type_enum" NOT NULL,
        "status" "public"."privacy_request_status_enum" NOT NULL DEFAULT 'PENDING',
        "processed_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_privacy_requests" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_privacy_requests_user_id" ON "privacy_requests" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_privacy_requests_request_type" ON "privacy_requests" ("request_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_privacy_requests_status" ON "privacy_requests" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_privacy_requests_created_at" ON "privacy_requests" ("created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "consent_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "user_id" uuid NOT NULL,
        "consent_type" "public"."consent_type_enum" NOT NULL,
        "accepted" boolean NOT NULL DEFAULT false,
        "accepted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_consent_records" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_consent_records_user_id" ON "consent_records" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_consent_records_consent_type" ON "consent_records" ("consent_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_consent_records_created_at" ON "consent_records" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "consent_records"`);
    await queryRunner.query(`DROP TABLE "privacy_requests"`);
    await queryRunner.query(`DROP TABLE "security_events"`);
    await queryRunner.query(`DROP TABLE "security_sessions"`);
    await queryRunner.query(`DROP TABLE "login_activities"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TYPE "public"."consent_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."privacy_request_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."privacy_request_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."severity_level_enum"`);
    await queryRunner.query(`DROP TYPE "public"."security_event_type_enum"`);
  }
}
