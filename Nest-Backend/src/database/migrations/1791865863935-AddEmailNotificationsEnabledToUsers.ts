import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailNotificationsEnabledToUsers1791865863935 implements MigrationInterface {
  name = 'AddEmailNotificationsEnabledToUsers1791865863935';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_notifications_enabled" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "email_notifications_enabled"`);
  }
}
