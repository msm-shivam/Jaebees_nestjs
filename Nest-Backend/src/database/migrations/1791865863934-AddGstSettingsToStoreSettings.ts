import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGstSettingsToStoreSettings1791865863934
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('store_settings');

    if (table) {
      if (!table.findColumnByName('gst_enabled')) {
        await queryRunner.addColumn(
          'store_settings',
          new TableColumn({
            name: 'gst_enabled',
            type: 'boolean',
            default: true,
          }),
        );
      }

      if (!table.findColumnByName('gst_type')) {
        await queryRunner.addColumn(
          'store_settings',
          new TableColumn({
            name: 'gst_type',
            type: 'varchar',
            length: '20',
            default: `'exclusive'`,
          }),
        );
      }

      if (!table.findColumnByName('gst_rate')) {
        await queryRunner.addColumn(
          'store_settings',
          new TableColumn({
            name: 'gst_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 10.0,
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('store_settings');
    if (table) {
      if (table.findColumnByName('gst_rate')) {
        await queryRunner.dropColumn('store_settings', 'gst_rate');
      }
      if (table.findColumnByName('gst_type')) {
        await queryRunner.dropColumn('store_settings', 'gst_type');
      }
      if (table.findColumnByName('gst_enabled')) {
        await queryRunner.dropColumn('store_settings', 'gst_enabled');
      }
    }
  }
}
