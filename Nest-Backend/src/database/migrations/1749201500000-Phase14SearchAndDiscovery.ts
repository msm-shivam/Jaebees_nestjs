import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class Phase14SearchAndDiscovery1749201500000 implements MigrationInterface {
  name = 'Phase14SearchAndDiscovery1749201500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── search_logs ──────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'search_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'keyword', type: 'varchar', length: '255' },
          { name: 'results_count', type: 'int', default: 0 },
          { name: 'clicked_product_id', type: 'uuid', isNullable: true },
          { name: 'converted_order_id', type: 'uuid', isNullable: true },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'search_logs',
      new TableIndex({
        name: 'idx_search_logs_keyword',
        columnNames: ['keyword'],
      }),
    );
    await queryRunner.createIndex(
      'search_logs',
      new TableIndex({
        name: 'idx_search_logs_user',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'search_logs',
      new TableIndex({
        name: 'idx_search_logs_created_at',
        columnNames: ['created_at'],
      }),
    );

    // ── recent_searches ──────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'recent_searches',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'keyword', type: 'varchar', length: '255' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'recent_searches',
      new TableIndex({
        name: 'idx_recent_searches_user_keyword',
        columnNames: ['user_id', 'keyword'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'recent_searches',
      new TableIndex({
        name: 'idx_recent_searches_user',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'recent_searches',
      new TableForeignKey({
        name: 'fk_recent_searches_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ── product_views ────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'product_views',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'product_id', type: 'uuid' },
          { name: 'viewed_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'product_views',
      new TableIndex({
        name: 'idx_product_views_user_product',
        columnNames: ['user_id', 'product_id'],
      }),
    );
    await queryRunner.createIndex(
      'product_views',
      new TableIndex({
        name: 'idx_product_views_product',
        columnNames: ['product_id'],
      }),
    );
    await queryRunner.createIndex(
      'product_views',
      new TableIndex({
        name: 'idx_product_views_viewed_at',
        columnNames: ['viewed_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'product_views',
      new TableForeignKey({
        name: 'fk_product_views_product',
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'product_views',
      new TableForeignKey({
        name: 'fk_product_views_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "product_views"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recent_searches"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "search_logs"`);
  }
}
