import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSmtpColumnsToStoreSettings1791865863922
  implements MigrationInterface
{
  name = 'AddSmtpColumnsToStoreSettings1791865863922';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'store_settings',
      new TableColumn({
        name: 'smtp_host',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'store_settings',
      new TableColumn({
        name: 'smtp_port',
        type: 'int',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'store_settings',
      new TableColumn({
        name: 'smtp_user',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'store_settings',
      new TableColumn({
        name: 'smtp_pass',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'store_settings',
      new TableColumn({
        name: 'smtp_secure',
        type: 'boolean',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'store_settings',
      new TableColumn({
        name: 'email_provider',
        type: 'varchar',
        length: '50',
        isNullable: true,
        default: "'smtp'",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('store_settings', 'email_provider');
    await queryRunner.dropColumn('store_settings', 'smtp_secure');
    await queryRunner.dropColumn('store_settings', 'smtp_pass');
    await queryRunner.dropColumn('store_settings', 'smtp_user');
    await queryRunner.dropColumn('store_settings', 'smtp_port');
    await queryRunner.dropColumn('store_settings', 'smtp_host');
  }
}
