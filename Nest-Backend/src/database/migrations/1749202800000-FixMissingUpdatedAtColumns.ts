import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FixMissingUpdatedAtColumns1749202800000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix 1: Add missing updated_at column to order_items table
    const orderItemsTable = await queryRunner.getTable('order_items');
    if (orderItemsTable) {
      const updatedAtCol = orderItemsTable.findColumnByName('updated_at');
      if (!updatedAtCol) {
        await queryRunner.addColumn(
          'order_items',
          new TableColumn({
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          }),
        );
        console.log('✅ Added updated_at column to order_items table');
      }
    }

    // Fix 2: Add missing updated_at column to payment_refunds table
    const paymentRefundsTable = await queryRunner.getTable('payment_refunds');
    if (paymentRefundsTable) {
      const updatedAtCol = paymentRefundsTable.findColumnByName('updated_at');
      if (!updatedAtCol) {
        await queryRunner.addColumn(
          'payment_refunds',
          new TableColumn({
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          }),
        );
        console.log('✅ Added updated_at column to payment_refunds table');
      }
    }

    // Fix 3: Add missing updated_at column to cart_items table
    const cartItemsTable = await queryRunner.getTable('cart_items');
    if (cartItemsTable) {
      const updatedAtCol = cartItemsTable.findColumnByName('updated_at');
      if (!updatedAtCol) {
        await queryRunner.addColumn(
          'cart_items',
          new TableColumn({
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          }),
        );
        console.log('✅ Added updated_at column to cart_items table');
      }
    }

    // Fix 4: Add missing updated_at column to purchase_order_items table
    const purchaseOrderItemsTable = await queryRunner.getTable(
      'purchase_order_items',
    );
    if (purchaseOrderItemsTable) {
      const updatedAtCol =
        purchaseOrderItemsTable.findColumnByName('updated_at');
      if (!updatedAtCol) {
        await queryRunner.addColumn(
          'purchase_order_items',
          new TableColumn({
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          }),
        );
        console.log('✅ Added updated_at column to purchase_order_items table');
      }
    }

    // Fix 5: Add deleted_at column to orders table if missing
    const ordersTable = await queryRunner.getTable('orders');
    if (ordersTable) {
      const deletedAtCol = ordersTable.findColumnByName('deleted_at');
      if (!deletedAtCol) {
        await queryRunner.addColumn(
          'orders',
          new TableColumn({
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          }),
        );
        console.log('✅ Added deleted_at column to orders table');
      }
    }

    // Fix 6: Add missing updated_at column to goods_receipt_items table
    const goodsReceiptItemsTable = await queryRunner.getTable(
      'goods_receipt_items',
    );
    if (goodsReceiptItemsTable) {
      const updatedAtCol =
        goodsReceiptItemsTable.findColumnByName('updated_at');
      if (!updatedAtCol) {
        await queryRunner.addColumn(
          'goods_receipt_items',
          new TableColumn({
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          }),
        );
        console.log('✅ Added updated_at column to goods_receipt_items table');
      }
    }

    // Fix 7: Add missing updated_at column to return_items table
    const returnItemsTable = await queryRunner.getTable('return_items');
    if (returnItemsTable) {
      const updatedAtCol = returnItemsTable.findColumnByName('updated_at');
      if (!updatedAtCol) {
        await queryRunner.addColumn(
          'return_items',
          new TableColumn({
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          }),
        );
        console.log('✅ Added updated_at column to return_items table');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert all added columns
    const tables = [
      'order_items',
      'payment_refunds',
      'cart_items',
      'purchase_order_items',
      'goods_receipt_items',
      'return_items',
    ];

    for (const table of tables) {
      try {
        await queryRunner.dropColumn(table, 'updated_at');
      } catch {
        // Column might not exist, ignore
      }
    }

    try {
      await queryRunner.dropColumn('orders', 'deleted_at');
    } catch {
      // Column might not exist, ignore
    }
  }
}