import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class Phase6Orders1749200600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'order_number',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          { name: 'user_id', type: 'uuid' },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'PENDING',
              'CONFIRMED',
              'PROCESSING',
              'PACKED',
              'SHIPPED',
              'OUT_FOR_DELIVERY',
              'DELIVERED',
              'CANCELLED',
              'RETURN_REQUESTED',
              'RETURNED',
            ],
            default: "'PENDING'",
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'discount_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'shipping_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'tax_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'total_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          { name: 'notes', type: 'text', isNullable: true },
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

    await queryRunner.createTable(
      new Table({
        name: 'order_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'order_id', type: 'uuid' },
          { name: 'product_id', type: 'uuid' },
          { name: 'variant_id', type: 'uuid' },
          { name: 'product_name', type: 'varchar', length: '255' },
          { name: 'sku', type: 'varchar', length: '150' },
          { name: 'quantity', type: 'int' },
          { name: 'unit_price', type: 'decimal', precision: 12, scale: 2 },
          { name: 'total_price', type: 'decimal', precision: 12, scale: 2 },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Indexes for orders
    await queryRunner.createIndex(
      'orders',
      new TableIndex({ name: 'idx_orders_user_id', columnNames: ['user_id'] }),
    );
    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'idx_orders_order_number',
        columnNames: ['order_number'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'orders',
      new TableIndex({ name: 'idx_orders_status', columnNames: ['status'] }),
    );
    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'idx_orders_created_at',
        columnNames: ['created_at'],
      }),
    );

    // Indexes for order_items
    await queryRunner.createIndex(
      'order_items',
      new TableIndex({
        name: 'idx_order_items_order_id',
        columnNames: ['order_id'],
      }),
    );
    await queryRunner.createIndex(
      'order_items',
      new TableIndex({
        name: 'idx_order_items_variant_id',
        columnNames: ['variant_id'],
      }),
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        name: 'fk_orders_user_id',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        name: 'fk_order_items_order_id',
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        name: 'fk_order_items_product_id',
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        name: 'fk_order_items_variant_id',
        columnNames: ['variant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product_variants',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'order_items',
      'fk_order_items_variant_id',
    );
    await queryRunner.dropForeignKey(
      'order_items',
      'fk_order_items_product_id',
    );
    await queryRunner.dropForeignKey('order_items', 'fk_order_items_order_id');
    await queryRunner.dropForeignKey('orders', 'fk_orders_user_id');

    await queryRunner.dropIndex('order_items', 'idx_order_items_variant_id');
    await queryRunner.dropIndex('order_items', 'idx_order_items_order_id');
    await queryRunner.dropIndex('orders', 'idx_orders_created_at');
    await queryRunner.dropIndex('orders', 'idx_orders_status');
    await queryRunner.dropIndex('orders', 'idx_orders_order_number');
    await queryRunner.dropIndex('orders', 'idx_orders_user_id');

    await queryRunner.dropTable('order_items');
    await queryRunner.dropTable('orders');
  }
}
