import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMissingUpdatedAtColumns1749202800000 implements MigrationInterface {
  name = 'AddMissingUpdatedAtColumns1749202800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // order_items: has created_at but missing updated_at
    await queryRunner.addColumn(
      'order_items',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp with time zone',
        default: 'now()',
      }),
    );

    // payment_refunds: has created_at but missing updated_at
    await queryRunner.addColumn(
      'payment_refunds',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp with time zone',
        default: 'now()',
      }),
    );

    // payment_logs: has created_at but missing updated_at
    await queryRunner.addColumn(
      'payment_logs',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp with time zone',
        default: 'now()',
      }),
    );

    // payment_webhooks: has created_at but missing updated_at
    await queryRunner.addColumn(
      'payment_webhooks',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp with time zone',
        default: 'now()',
      }),
    );

    // shipment_tracking_logs: has created_at but missing updated_at
    await queryRunner.addColumn(
      'shipment_tracking_logs',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp with time zone',
        default: 'now()',
      }),
    );

    // product_views: missing both created_at AND updated_at
    await queryRunner.addColumn(
      'product_views',
      new TableColumn({
        name: 'created_at',
        type: 'timestamp with time zone',
        default: 'now()',
      }),
    );
    await queryRunner.addColumn(
      'product_views',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp with time zone',
        default: 'now()',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('product_views', 'updated_at');
    await queryRunner.dropColumn('product_views', 'created_at');
    await queryRunner.dropColumn('shipment_tracking_logs', 'updated_at');
    await queryRunner.dropColumn('payment_webhooks', 'updated_at');
    await queryRunner.dropColumn('payment_logs', 'updated_at');
    await queryRunner.dropColumn('payment_refunds', 'updated_at');
    await queryRunner.dropColumn('order_items', 'updated_at');
  }
}
