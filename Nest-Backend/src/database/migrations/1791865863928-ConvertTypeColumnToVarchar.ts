import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertTypeColumnToVarchar1791865863928 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "otp_verifications" ALTER COLUMN "type" DROP NOT NULL;
      ALTER TABLE "otp_verifications" ALTER COLUMN "type" TYPE varchar(50) USING "type"::text;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "otp_verifications" ALTER COLUMN "type" DROP NOT NULL;
    `);
  }
}
