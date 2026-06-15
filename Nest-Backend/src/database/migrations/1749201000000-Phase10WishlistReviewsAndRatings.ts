import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
  TableColumn,
} from 'typeorm';

export class Phase10WishlistReviewsAndRatings1749201000000 implements MigrationInterface {
  name = 'Phase10WishlistReviewsAndRatings1749201000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wishlists',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'wishlist_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'wishlist_id', type: 'uuid' },
          { name: 'product_id', type: 'uuid' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'reviews',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'product_id', type: 'uuid' },
          { name: 'order_id', type: 'uuid' },
          { name: 'order_item_id', type: 'uuid', isUnique: true },
          { name: 'rating', type: 'smallint' },
          { name: 'title', type: 'varchar', length: '255', isNullable: true },
          { name: 'comment', type: 'text', isNullable: true },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: `'PENDING'`,
          },
          { name: 'is_verified_purchase', type: 'boolean', default: true },
          { name: 'approved_by', type: 'uuid', isNullable: true },
          { name: 'approved_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'review_images',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'review_id', type: 'uuid' },
          { name: 'image_url', type: 'varchar', length: '500' },
          { name: 'sort_order', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.createIndex(
      'wishlists',
      new TableIndex({
        name: 'idx_wishlists_user',
        columnNames: ['user_id'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'wishlist_items',
      new TableIndex({
        name: 'idx_wishlist_items_wishlist',
        columnNames: ['wishlist_id'],
      }),
    );
    await queryRunner.createIndex(
      'wishlist_items',
      new TableIndex({
        name: 'idx_wishlist_items_product',
        columnNames: ['product_id'],
      }),
    );
    await queryRunner.createIndex(
      'reviews',
      new TableIndex({
        name: 'idx_reviews_product',
        columnNames: ['product_id'],
      }),
    );
    await queryRunner.createIndex(
      'reviews',
      new TableIndex({
        name: 'idx_reviews_user',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'reviews',
      new TableIndex({
        name: 'idx_reviews_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'review_images',
      new TableIndex({
        name: 'idx_review_images_review',
        columnNames: ['review_id'],
      }),
    );

    // Unique constraints
    await queryRunner.query(
      `ALTER TABLE "wishlist_items" ADD CONSTRAINT "uq_wishlist_items_product" UNIQUE ("wishlist_id", "product_id")`,
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'wishlists',
      new TableForeignKey({
        name: 'fk_wishlists_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'wishlist_items',
      new TableForeignKey({
        name: 'fk_wishlist_items_wishlist',
        columnNames: ['wishlist_id'],
        referencedTableName: 'wishlists',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'wishlist_items',
      new TableForeignKey({
        name: 'fk_wishlist_items_product',
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'reviews',
      new TableForeignKey({
        name: 'fk_reviews_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'reviews',
      new TableForeignKey({
        name: 'fk_reviews_product',
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'reviews',
      new TableForeignKey({
        name: 'fk_reviews_order',
        columnNames: ['order_id'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'reviews',
      new TableForeignKey({
        name: 'fk_reviews_order_item',
        columnNames: ['order_item_id'],
        referencedTableName: 'order_items',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'review_images',
      new TableForeignKey({
        name: 'fk_review_images_review',
        columnNames: ['review_id'],
        referencedTableName: 'reviews',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add columns to products table
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'average_rating',
        type: 'decimal',
        precision: 3,
        scale: 2,
        default: 0,
      }),
    );
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'review_count',
        type: 'int',
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('products', 'review_count');
    await queryRunner.dropColumn('products', 'average_rating');
    await queryRunner.dropTable('review_images');
    await queryRunner.dropTable('reviews');
    await queryRunner.dropTable('wishlist_items');
    await queryRunner.dropTable('wishlists');
  }
}
