import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class Phase9PromotionsAndDiscounts1749200900000 implements MigrationInterface {
  name = 'Phase9PromotionsAndDiscounts1749200900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'coupons',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'code', type: 'varchar', length: '50', isUnique: true },
          { name: 'name', type: 'varchar', length: '200' },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'type',
            type: 'enum',
            enum: ['GENERAL', 'FIRST_ORDER', 'CATEGORY', 'PRODUCT'],
            default: `'GENERAL'`,
          },
          {
            name: 'discount_type',
            type: 'enum',
            enum: ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'],
          },
          { name: 'discount_value', type: 'decimal', precision: 10, scale: 2 },
          {
            name: 'minimum_order_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'maximum_discount_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          { name: 'usage_limit', type: 'int', isNullable: true },
          { name: 'usage_per_user', type: 'int', isNullable: true },
          { name: 'used_count', type: 'int', default: 0 },
          { name: 'starts_at', type: 'timestamptz' },
          { name: 'expires_at', type: 'timestamptz' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_by', type: 'uuid' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'promotions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '200' },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'status',
            type: 'enum',
            enum: ['DRAFT', 'ACTIVE', 'EXPIRED', 'PAUSED'],
            default: `'DRAFT'`,
          },
          {
            name: 'discount_type',
            type: 'enum',
            enum: ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'],
          },
          { name: 'discount_value', type: 'decimal', precision: 10, scale: 2 },
          { name: 'start_date', type: 'timestamptz' },
          { name: 'end_date', type: 'timestamptz' },
          { name: 'priority', type: 'int', default: 0 },
          { name: 'is_stackable', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'discount_rules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'promotion_id', type: 'uuid' },
          { name: 'category_id', type: 'uuid', isNullable: true },
          { name: 'product_id', type: 'uuid', isNullable: true },
          { name: 'variant_id', type: 'uuid', isNullable: true },
          { name: 'minimum_quantity', type: 'int', isNullable: true },
          {
            name: 'minimum_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          { name: 'buy_quantity', type: 'int', isNullable: true },
          { name: 'get_quantity', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'coupon_usages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'coupon_id', type: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'order_id', type: 'uuid' },
          { name: 'discount_amount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'used_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.createIndex(
      'coupons',
      new TableIndex({
        name: 'idx_coupons_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'coupons',
      new TableIndex({
        name: 'idx_coupons_active_period',
        columnNames: ['is_active', 'starts_at', 'expires_at'],
      }),
    );
    await queryRunner.createIndex(
      'promotions',
      new TableIndex({
        name: 'idx_promotions_status_dates',
        columnNames: ['status', 'start_date', 'end_date'],
      }),
    );
    await queryRunner.createIndex(
      'discount_rules',
      new TableIndex({
        name: 'idx_discount_rules_promotion',
        columnNames: ['promotion_id'],
      }),
    );
    await queryRunner.createIndex(
      'coupon_usages',
      new TableIndex({
        name: 'idx_coupon_usages_coupon',
        columnNames: ['coupon_id'],
      }),
    );
    await queryRunner.createIndex(
      'coupon_usages',
      new TableIndex({
        name: 'idx_coupon_usages_user',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'coupon_usages',
      new TableIndex({
        name: 'idx_coupon_usages_order',
        columnNames: ['order_id'],
      }),
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'coupons',
      new TableForeignKey({
        name: 'fk_coupons_created_by',
        columnNames: ['created_by'],
        referencedTableName: 'admin_users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'discount_rules',
      new TableForeignKey({
        name: 'fk_discount_rules_promotion',
        columnNames: ['promotion_id'],
        referencedTableName: 'promotions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'coupon_usages',
      new TableForeignKey({
        name: 'fk_coupon_usages_coupon',
        columnNames: ['coupon_id'],
        referencedTableName: 'coupons',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'coupon_usages',
      new TableForeignKey({
        name: 'fk_coupon_usages_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'coupon_usages',
      new TableForeignKey({
        name: 'fk_coupon_usages_order',
        columnNames: ['order_id'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('coupon_usages');
    await queryRunner.dropTable('discount_rules');
    await queryRunner.dropTable('promotions');
    await queryRunner.dropTable('coupons');
  }
}
