import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDeletedAtToAddresses1791865863932
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('addresses');
    if (table && !table.findColumnByName('deleted_at')) {
      await queryRunner.addColumn(
        'addresses',
        new TableColumn({
          name: 'deleted_at',
          type: 'timestamptz',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('addresses');
    if (table && table.findColumnByName('deleted_at')) {
      await queryRunner.dropColumn('addresses', 'deleted_at');
    }
  }
}
