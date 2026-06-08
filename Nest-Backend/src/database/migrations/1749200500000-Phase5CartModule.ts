import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class Phase5CartModule1749200500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create carts table
    await queryRunner.createTable(
      new Table({
        name: 'carts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'total_items',
            type: 'int',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create cart_items table
    await queryRunner.createTable(
      new Table({
        name: 'cart_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'cart_id',
            type: 'uuid',
          },
          {
            name: 'variant_id',
            type: 'uuid',
          },
          {
            name: 'quantity',
            type: 'int',
          },
          {
            name: 'unit_price',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'line_total',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create indexes for carts
    await queryRunner.createIndex(
      'carts',
      new TableIndex({
        name: 'idx_carts_user_id',
        columnNames: ['user_id'],
      }),
    );

    // Create indexes for cart_items
    await queryRunner.createIndex(
      'cart_items',
      new TableIndex({
        name: 'idx_cart_items_cart_id',
        columnNames: ['cart_id'],
      }),
    );

    await queryRunner.createIndex(
      'cart_items',
      new TableIndex({
        name: 'idx_cart_items_variant_id',
        columnNames: ['variant_id'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'carts',
      new TableForeignKey({
        name: 'fk_carts_user_id',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        name: 'fk_cart_items_cart_id',
        columnNames: ['cart_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'carts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        name: 'fk_cart_items_variant_id',
        columnNames: ['variant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product_variants',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('cart_items', 'fk_cart_items_variant_id');
    await queryRunner.dropForeignKey('cart_items', 'fk_cart_items_cart_id');
    await queryRunner.dropForeignKey('carts', 'fk_carts_user_id');

    await queryRunner.dropIndex('cart_items', 'idx_cart_items_variant_id');
    await queryRunner.dropIndex('cart_items', 'idx_cart_items_cart_id');
    await queryRunner.dropIndex('carts', 'idx_carts_user_id');

    await queryRunner.dropTable('cart_items');
    await queryRunner.dropTable('carts');
  }
}
