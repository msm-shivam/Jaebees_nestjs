import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase18Part2SupportEnhancements1749202200000 implements MigrationInterface {
  name = 'Phase18Part2SupportEnhancements1749202200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ticket_attachments
    await queryRunner.query(`
      CREATE TABLE "ticket_attachments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "ticket_id" uuid NOT NULL,
        "file_url" character varying(500) NOT NULL,
        "file_name" character varying(255) NOT NULL,
        "uploaded_by" uuid NOT NULL,
        CONSTRAINT "PK_ticket_attachments" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_ticket_attachments_ticket_id" ON "ticket_attachments" ("ticket_id")`);
    await queryRunner.query(`ALTER TABLE "ticket_attachments" ADD CONSTRAINT "FK_ticket_attachments_ticket_id" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE`);

    // ticket_audits
    await queryRunner.query(`
      CREATE TYPE "public"."ticket_audit_action_enum" AS ENUM (
        'status_change', 'priority_change', 'assign', 'resolve', 'reopen', 'note_added'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "ticket_audits" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "ticket_id" uuid NOT NULL,
        "action" character varying(50) NOT NULL,
        "previous_status" "public"."ticket_status_enum",
        "new_status" "public"."ticket_status_enum",
        "previous_priority" "public"."ticket_priority_enum",
        "new_priority" "public"."ticket_priority_enum",
        "previous_assignee" uuid,
        "new_assignee" uuid,
        "performed_by" uuid,
        "notes" text,
        CONSTRAINT "PK_ticket_audits" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_ticket_audits_ticket_id" ON "ticket_audits" ("ticket_id")`);
    await queryRunner.query(`ALTER TABLE "ticket_audits" ADD CONSTRAINT "FK_ticket_audits_ticket_id" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE`);

    // ticket_ratings
    await queryRunner.query(`
      CREATE TABLE "ticket_ratings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "ticket_id" uuid NOT NULL,
        "rating" integer NOT NULL,
        "comment" text,
        CONSTRAINT "PK_ticket_ratings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_ticket_ratings_ticket_id" UNIQUE ("ticket_id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_ticket_ratings_ticket_id" ON "ticket_ratings" ("ticket_id")`);
    await queryRunner.query(`ALTER TABLE "ticket_ratings" ADD CONSTRAINT "FK_ticket_ratings_ticket_id" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE`);

    // ticket_tags
    await queryRunner.query(`
      CREATE TABLE "ticket_tags" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "ticket_id" uuid NOT NULL,
        "tag" character varying(50) NOT NULL,
        CONSTRAINT "PK_ticket_tags" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_ticket_tags_ticket_id" ON "ticket_tags" ("ticket_id")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_ticket_tags_tag_ticket" ON "ticket_tags" ("tag", "ticket_id")`);
    await queryRunner.query(`ALTER TABLE "ticket_tags" ADD CONSTRAINT "FK_ticket_tags_ticket_id" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ticket_tags" DROP CONSTRAINT "FK_ticket_tags_ticket_id"`);
    await queryRunner.query(`DROP INDEX "idx_ticket_tags_tag_ticket"`);
    await queryRunner.query(`DROP INDEX "idx_ticket_tags_ticket_id"`);
    await queryRunner.query(`DROP TABLE "ticket_tags"`);

    await queryRunner.query(`ALTER TABLE "ticket_ratings" DROP CONSTRAINT "FK_ticket_ratings_ticket_id"`);
    await queryRunner.query(`DROP INDEX "idx_ticket_ratings_ticket_id"`);
    await queryRunner.query(`DROP TABLE "ticket_ratings"`);

    await queryRunner.query(`ALTER TABLE "ticket_audits" DROP CONSTRAINT "FK_ticket_audits_ticket_id"`);
    await queryRunner.query(`DROP INDEX "idx_ticket_audits_ticket_id"`);
    await queryRunner.query(`DROP TABLE "ticket_audits"`);
    await queryRunner.query(`DROP TYPE "public"."ticket_audit_action_enum"`);

    await queryRunner.query(`ALTER TABLE "ticket_attachments" DROP CONSTRAINT "FK_ticket_attachments_ticket_id"`);
    await queryRunner.query(`DROP INDEX "idx_ticket_attachments_ticket_id"`);
    await queryRunner.query(`DROP TABLE "ticket_attachments"`);
  }
}
