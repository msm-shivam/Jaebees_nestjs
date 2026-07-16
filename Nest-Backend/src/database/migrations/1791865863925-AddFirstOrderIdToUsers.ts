import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFirstOrderIdToUsers1791865863925 implements MigrationInterface {
  name = 'AddFirstOrderIdToUsers1791865863925';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "first_order_id" uuid DEFAULT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "first_order_id"
    `);
  }
}
