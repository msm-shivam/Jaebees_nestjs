import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';
import { v4 as uuid } from 'uuid';

dotenv.config();

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function seed() {
  console.log('Connecting...');
  await AppDataSource.initialize();
  const qr = AppDataSource.createQueryRunner();

  const cleanTables = [ 
    'tax_records', 'settlements', 'expense_records', 'ledger_entries',
    'financial_audits', 'financial_transactions',
  ];
  for (const name of cleanTables) {
    try { await qr.query(`DELETE FROM "${name}"`); } catch { /* skip */ }
  }
  console.log('Cleared finance data');

  const now = new Date();

  // Fetch existing orders with payment info
  const orderRows = await qr.query(
    `SELECT o.id, o.order_number, o.total_amount, o.subtotal, o.paid_amount, o.payment_status, o.created_at,
            u.id as user_id
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at`,
  );
  console.log(`  Found ${orderRows.length} orders`);

  // Fetch admin user for created_by
  const adminRows = await qr.query(
    `SELECT id FROM admin_users LIMIT 1`,
  );
  const adminId = adminRows[0]?.id ?? null;

  let txCount = 0, expenseCount = 0, settlementCount = 0, taxCount = 0;

  for (const order of orderRows) {
    const orderCreatedAt = new Date(order.created_at);

    // ORDER_PAYMENT transaction for paid orders
    if (order.payment_status === 'PAID' || order.payment_status === 'REFUNDED') {
      const txId = uuid();
      const txNumber = `TXN-${order.order_number}`;
      await qr.query(
        `INSERT INTO financial_transactions (id, transaction_number, type, amount, status, reference_type, reference_id, description, transaction_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)`,
        [txId, txNumber, 'ORDER_PAYMENT', order.paid_amount, 'COMPLETED', 'order', order.id,
         `Payment for ${order.order_number}`, orderCreatedAt, orderCreatedAt],
      );
      txCount++;

      // Refund transaction if refunded
      if (order.payment_status === 'REFUNDED') {
        const refundTxId = uuid();
        await qr.query(
          `INSERT INTO financial_transactions (id, transaction_number, type, amount, status, reference_type, reference_id, description, transaction_date, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)`,
          [refundTxId, `RFD-${order.order_number}`, 'REFUND', order.paid_amount, 'COMPLETED', 'order', order.id,
           `Refund for ${order.order_number}`, addDays(orderCreatedAt, 2), orderCreatedAt],
        );
        txCount++;
      }

      // Tax record (5% VAT)
      const taxRate = 5.00;
      const taxableAmount = order.subtotal;
      const taxAmount = Math.round(taxableAmount * taxRate / 100 * 100) / 100;
      if (taxAmount > 0) {
        await qr.query(
          `INSERT INTO tax_records (id, order_id, taxable_amount, tax_amount, tax_rate, tax_type, tax_date, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
          [uuid(), order.id, taxableAmount, taxAmount, taxRate, 'VAT', orderCreatedAt, orderCreatedAt],
        );
        taxCount++;
      }
    }
  }

  // Monthly expense records
  const expenseCategories = ['Rent', 'Utilities', 'Salaries', 'Marketing', 'Logistics', 'Office Supplies'];
  for (let i = 0; i < 8; i++) {
    const expenseDate = addDays(new Date(now.getFullYear(), now.getMonth() - 2, 1), i * 10);
    for (const cat of expenseCategories) {
      const amount = Math.round(Math.random() * 500000 + 10000) / 100;
      await qr.query(
        `INSERT INTO expense_records (id, category, amount, expense_date, description, vendor_name, invoice_number, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)`,
        [uuid(), cat, amount, expenseDate, `${cat} expense - ${expenseDate.toLocaleDateString()}`, `Vendor-${cat}`, `INV-${cat.toUpperCase().slice(0, 3)}-${i + 1}`, adminId, expenseDate],
      );
      expenseCount++;
    }
  }

  // Supplier settlements
  const supplierIds = [uuid(), uuid(), uuid()];
  for (let i = 0; i < 4; i++) {
    const setDate = addDays(now, -(30 - i * 7));
    const dueDate = addDays(setDate, 30);
    const amount = Math.round(Math.random() * 200000 + 50000);
    await qr.query(
      `INSERT INTO settlements (id, settlement_number, supplier_id, amount, status, settlement_date, due_date, description, reference_type, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)`,
      [uuid(), `STL-${String(i + 1).padStart(4, '0')}`, supplierIds[i % supplierIds.length], amount,
       i < 2 ? 'COMPLETED' : 'PENDING', setDate, dueDate,
       `Supplier settlement ${i + 1}`, 'supplier_order', setDate],
    );
    settlementCount++;
  }

  console.log(`\nTransactions: ${txCount}, Expenses: ${expenseCount}, Settlements: ${settlementCount}, Tax Records: ${taxCount}`);

  await qr.release();
  await AppDataSource.destroy();
  console.log('\nFinance seed completed!');
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
