import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDynamicSenderMappingsToStoreSettings1791865863931
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('store_settings');

    if (table) {
      if (!table.findColumnByName('allowed_senders')) {
        await queryRunner.addColumn(
          'store_settings',
          new TableColumn({
            name: 'allowed_senders',
            type: 'jsonb',
            isNullable: true,
            default: `'["support@jaebees.com", "orders@jaebees.com", "contact@jaebees.com", "info@jaebees.com", "admin@jaebees.com"]'`,
          }),
        );
      }

      if (!table.findColumnByName('sender_mappings')) {
        await queryRunner.addColumn(
          'store_settings',
          new TableColumn({
            name: 'sender_mappings',
            type: 'jsonb',
            isNullable: true,
            default: `'{"order": "orders@jaebees.com", "payment": "orders@jaebees.com", "shipment": "orders@jaebees.com", "return": "orders@jaebees.com", "support": "support@jaebees.com", "contact": "support@jaebees.com", "auth": "support@jaebees.com", "review": "support@jaebees.com", "marketing": "info@jaebees.com", "admin": "admin@jaebees.com"}'`,
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('store_settings');
    if (table) {
      if (table.findColumnByName('sender_mappings')) {
        await queryRunner.dropColumn('store_settings', 'sender_mappings');
      }
      if (table.findColumnByName('allowed_senders')) {
        await queryRunner.dropColumn('store_settings', 'allowed_senders');
      }
    }
  }
}
