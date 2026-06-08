import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class Phase4ProductVariantsAndInventory1749200400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create product_variants table
    await queryRunner.createTable(
      new Table({
        name: 'product_variants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'product_id',
            type: 'uuid',
          },
          {
            name: 'sku',
            type: 'varchar',
            length: '150',
            isUnique: true,
          },
          {
            name: 'barcode',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'compare_at_price',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'cost_price',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'weight',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'],
            default: "'ACTIVE'",
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
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

    // Create indexes for product_variants
    await queryRunner.createIndex(
      'product_variants',
      new TableIndex({
        name: 'idx_product_variants_product_id',
        columnNames: ['product_id'],
      }),
    );

    await queryRunner.createIndex(
      'product_variants',
      new TableIndex({
        name: 'idx_product_variants_sku',
        columnNames: ['sku'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'product_variants',
      new TableIndex({
        name: 'idx_product_variants_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'product_variants',
      new TableIndex({
        name: 'idx_product_variants_is_default',
        columnNames: ['is_default'],
      }),
    );

    // Create foreign key for product_variants.product_id
    await queryRunner.createForeignKey(
      'product_variants',
      new TableForeignKey({
        name: 'fk_product_variants_product_id',
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      }),
    );

    // Create product_variant_attributes table
    await queryRunner.createTable(
      new Table({
        name: 'product_variant_attributes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'variant_id',
            type: 'uuid',
          },
          {
            name: 'attribute_id',
            type: 'uuid',
          },
          {
            name: 'attribute_value_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create unique constraint on (variant_id, attribute_id)
    await queryRunner.createUniqueConstraint(
      'product_variant_attributes',
      new TableUnique({
        name: 'uq_product_variant_attributes_variant_attribute',
        columnNames: ['variant_id', 'attribute_id'],
      }),
    );

    // Create indexes for product_variant_attributes
    await queryRunner.createIndex(
      'product_variant_attributes',
      new TableIndex({
        name: 'idx_product_variant_attributes_variant_id',
        columnNames: ['variant_id'],
      }),
    );

    await queryRunner.createIndex(
      'product_variant_attributes',
      new TableIndex({
        name: 'idx_product_variant_attributes_attribute_id',
        columnNames: ['attribute_id'],
      }),
    );

    await queryRunner.createIndex(
      'product_variant_attributes',
      new TableIndex({
        name: 'idx_product_variant_attributes_attribute_value_id',
        columnNames: ['attribute_value_id'],
      }),
    );

    // Create foreign keys for product_variant_attributes
    await queryRunner.createForeignKey(
      'product_variant_attributes',
      new TableForeignKey({
        name: 'fk_product_variant_attributes_variant_id',
        columnNames: ['variant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product_variants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'product_variant_attributes',
      new TableForeignKey({
        name: 'fk_product_variant_attributes_attribute_id',
        columnNames: ['attribute_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'attributes',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'product_variant_attributes',
      new TableForeignKey({
        name: 'fk_product_variant_attributes_attribute_value_id',
        columnNames: ['attribute_value_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'attribute_values',
        onDelete: 'CASCADE',
      }),
    );

    // Create inventories table
    await queryRunner.createTable(
      new Table({
        name: 'inventories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'variant_id',
            type: 'uuid',
            isUnique: true,
          },
          {
            name: 'quantity',
            type: 'int',
            default: 0,
          },
          {
            name: 'reserved_quantity',
            type: 'int',
            default: 0,
          },
          {
            name: 'available_quantity',
            type: 'int',
            default: 0,
          },
          {
            name: 'low_stock_threshold',
            type: 'int',
            default: 5,
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

    // Create indexes for inventories
    await queryRunner.createIndex(
      'inventories',
      new TableIndex({
        name: 'idx_inventories_variant_id',
        columnNames: ['variant_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'inventories',
      new TableIndex({
        name: 'idx_inventories_quantity',
        columnNames: ['quantity'],
      }),
    );

    await queryRunner.createIndex(
      'inventories',
      new TableIndex({
        name: 'idx_inventories_available_quantity',
        columnNames: ['available_quantity'],
      }),
    );

    // Create foreign key for inventories.variant_id
    await queryRunner.createForeignKey(
      'inventories',
      new TableForeignKey({
        name: 'fk_inventories_variant_id',
        columnNames: ['variant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product_variants',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey(
      'inventories',
      'fk_inventories_variant_id',
    );
    await queryRunner.dropForeignKey(
      'product_variant_attributes',
      'fk_product_variant_attributes_attribute_value_id',
    );
    await queryRunner.dropForeignKey(
      'product_variant_attributes',
      'fk_product_variant_attributes_attribute_id',
    );
    await queryRunner.dropForeignKey(
      'product_variant_attributes',
      'fk_product_variant_attributes_variant_id',
    );
    await queryRunner.dropForeignKey(
      'product_variants',
      'fk_product_variants_product_id',
    );

    // Drop indexes
    await queryRunner.dropIndex(
      'inventories',
      'idx_inventories_available_quantity',
    );
    await queryRunner.dropIndex('inventories', 'idx_inventories_quantity');
    await queryRunner.dropIndex('inventories', 'idx_inventories_variant_id');
    await queryRunner.dropIndex(
      'product_variant_attributes',
      'idx_product_variant_attributes_attribute_value_id',
    );
    await queryRunner.dropIndex(
      'product_variant_attributes',
      'idx_product_variant_attributes_attribute_id',
    );
    await queryRunner.dropIndex(
      'product_variant_attributes',
      'idx_product_variant_attributes_variant_id',
    );
    await queryRunner.dropIndex(
      'product_variants',
      'idx_product_variants_is_default',
    );
    await queryRunner.dropIndex(
      'product_variants',
      'idx_product_variants_status',
    );
    await queryRunner.dropIndex('product_variants', 'idx_product_variants_sku');
    await queryRunner.dropIndex(
      'product_variants',
      'idx_product_variants_product_id',
    );

    // Drop unique constraint
    await queryRunner.dropUniqueConstraint(
      'product_variant_attributes',
      'uq_product_variant_attributes_variant_attribute',
    );

    // Drop tables
    await queryRunner.dropTable('inventories');
    await queryRunner.dropTable('product_variant_attributes');
    await queryRunner.dropTable('product_variants');
  }
}
