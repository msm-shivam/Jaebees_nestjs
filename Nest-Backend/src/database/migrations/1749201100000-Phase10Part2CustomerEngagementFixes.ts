import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class Phase10Part2CustomerEngagementFixes1749201100000 implements MigrationInterface {
  name = 'Phase10Part2CustomerEngagementFixes1749201100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add variant_id to wishlist_items
    await queryRunner.addColumn(
      'wishlist_items',
      new TableColumn({
        name: 'variant_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.createIndex(
      'wishlist_items',
      new TableIndex({
        name: 'idx_wishlist_items_variant',
        columnNames: ['variant_id'],
      }),
    );

    // Add helpful_count to reviews
    await queryRunner.addColumn(
      'reviews',
      new TableColumn({
        name: 'helpful_count',
        type: 'int',
        default: 0,
      }),
    );

    // Add deleted_at to review_images
    await queryRunner.addColumn(
      'review_images',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true,
      }),
    );

    // Alter enum to add HIDDEN
    await queryRunner.query(
      `ALTER TYPE "reviews_status_enum" ADD VALUE 'HIDDEN'`,
    );

    // Rename review_count -> total_reviews, add total_ratings
    await queryRunner.dropColumn('products', 'review_count');
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'total_ratings',
        type: 'int',
        default: 0,
      }),
    );
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'total_reviews',
        type: 'int',
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('products', 'total_reviews');
    await queryRunner.dropColumn('products', 'total_ratings');
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'review_count',
        type: 'int',
        default: 0,
      }),
    );
    await queryRunner.dropColumn('review_images', 'deleted_at');
    await queryRunner.dropColumn('reviews', 'helpful_count');
    await queryRunner.dropIndex('wishlist_items', 'idx_wishlist_items_variant');
    await queryRunner.dropColumn('wishlist_items', 'variant_id');
  }
}
