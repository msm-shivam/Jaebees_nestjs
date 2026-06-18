import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeProductSubCategoryNullable1749203200000 implements MigrationInterface {
  name = 'MakeProductSubCategoryNullable1749203200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "sub_category_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "sub_category_id" SET NOT NULL`,
    );
  }
}
