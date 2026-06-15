import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class Phase11WishlistSavedItems1749201200000 implements MigrationInterface {
  name = 'Phase11WishlistSavedItems1749201200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add total_items and deleted_at to wishlists
    await queryRunner.addColumn(
      'wishlists',
      new TableColumn({
        name: 'total_items',
        type: 'int',
        default: 0,
      }),
    );
    await queryRunner.addColumn(
      'wishlists',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true,
      }),
    );

    // Add added_at and deleted_at to wishlist_items
    await queryRunner.addColumn(
      'wishlist_items',
      new TableColumn({
        name: 'added_at',
        type: 'timestamptz',
        default: 'now()',
      }),
    );
    await queryRunner.addColumn(
      'wishlist_items',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true,
      }),
    );

    // Drop old unique constraint
    await queryRunner.query(
      `ALTER TABLE "wishlist_items" DROP CONSTRAINT IF EXISTS "uq_wishlist_items_product"`,
    );

    // Drop old variant index
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_wishlist_items_variant"`,
    );

    // Create new unique index that handles nullable variant_id
    // Uses COALESCE so (wishlist_id, product_id, null) and (wishlist_id, product_id, uuid) are distinct
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_wishlist_items_product_variant" ON "wishlist_items" ("wishlist_id", "product_id", COALESCE("variant_id", '00000000-0000-0000-0000-000000000000'::uuid))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "uq_wishlist_items_product_variant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_items" ADD CONSTRAINT "uq_wishlist_items_product" UNIQUE ("wishlist_id", "product_id")`,
    );
    await queryRunner.dropColumn('wishlist_items', 'deleted_at');
    await queryRunner.dropColumn('wishlist_items', 'added_at');
    await queryRunner.dropColumn('wishlists', 'deleted_at');
    await queryRunner.dropColumn('wishlists', 'total_items');
  }
}
