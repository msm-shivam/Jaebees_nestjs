import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTypeColumnNullableInOtpVerifications1791865863927 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "otp_verifications" ALTER COLUMN "type" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "otp_verifications" ALTER COLUMN "type" SET NOT NULL;
    `);
  }
}
