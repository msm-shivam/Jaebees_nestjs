import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';
import { User } from '../../modules/users/entities/user.entity';
import { Order, OrderStatus } from '../../modules/orders/entities/order.entity';
import { PaymentStatus } from '../../modules/payments/entities/payment-status.enum';
import { FinancialTransaction } from '../../modules/finance-accounting/entities/financial-transaction.entity';
import { ExpenseRecord } from '../../modules/finance-accounting/entities/expense-record.entity';
import { TransactionType } from '../../modules/finance-accounting/enums/transaction-type.enum';
import { faker } from '@faker-js/faker';

dotenv.config();

async function seedReports() {
  console.log('🌱 Connecting to database...');
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const orderRepo = AppDataSource.getRepository(Order);
  const transactionRepo = AppDataSource.getRepository(FinancialTransaction);
  const expenseRepo = AppDataSource.getRepository(ExpenseRecord);

  // Ensure we have at least one user
  let user = await userRepo.findOne({ where: {} });
  if (!user) {
    user = userRepo.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'customer@example.com',
      passwordHash: 'dummy',
      isEmailVerified: true,
      isActive: true,
    });
    await userRepo.save(user);
  }

  console.log(
    '📦 Seeding historical orders and financial transactions (last 6 months)...',
  );

  const orders: Order[] = [];
  const transactions: FinancialTransaction[] = [];
  const expenses: ExpenseRecord[] = [];

  const now = new Date();

  // Generate ~150 orders scattered over the last 180 days
  for (let i = 0; i < 150; i++) {
    const daysAgo = faker.number.int({ min: 0, max: 180 });
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const totalAmount = parseFloat(
      faker.finance.amount({ min: 50, max: 500, dec: 2 }),
    );
    const discountAmount =
      faker.number.int({ min: 0, max: 10 }) > 8
        ? parseFloat(faker.finance.amount({ min: 5, max: 20, dec: 2 }))
        : 0;
    const subtotal = totalAmount + discountAmount;

    // 85% completed, 10% cancelled, 5% returned
    const statusRand = faker.number.int({ min: 1, max: 100 });
    let status = OrderStatus.DELIVERED;
    if (statusRand > 85 && statusRand <= 95) status = OrderStatus.CANCELLED;
    if (statusRand > 95) status = OrderStatus.RETURNED;

    const order = orderRepo.create({
      orderNumber: `ORD-SEED-${faker.string.alphanumeric(8).toUpperCase()}`,
      userId: user.id,
      status: status,
      subtotal,
      discountAmount,
      shippingAmount: 0,
      deliveryCharge: 0,
      codCharge: 0,
      handlingCharge: 0,
      taxAmount: 0,
      totalAmount,
      paymentStatus:
        status === OrderStatus.CANCELLED
          ? PaymentStatus.FAILED
          : PaymentStatus.PAID,
      paidAmount: status !== OrderStatus.CANCELLED ? totalAmount : 0,
      dueAmount: 0,
    });

    // Override dates
    order.createdAt = createdAt;
    order.updatedAt = createdAt;

    orders.push(order);
  }

  const savedOrders = await orderRepo.save(orders);

  // For each completed order, create a financial transaction
  for (const o of savedOrders) {
    if (o.status !== OrderStatus.CANCELLED) {
      const transaction = transactionRepo.create({
        type: TransactionType.ORDER_PAYMENT,
        amount: o.totalAmount,
        transactionNumber: `TXN-${faker.string.alphanumeric(8).toUpperCase()}`,
        status: 'COMPLETED',
        referenceId: o.id,
        referenceType: 'ORDER',
        transactionDate: o.createdAt,
      });
      transactions.push(transaction);

      // If returned, create a refund transaction 3 days later
      if (o.status === OrderStatus.RETURNED) {
        const refundDate = new Date(
          o.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000,
        );
        const refund = transactionRepo.create({
          type: TransactionType.REFUND,
          amount: o.totalAmount,
          transactionNumber: `REF-${faker.string.alphanumeric(8).toUpperCase()}`,
          status: 'COMPLETED',
          referenceId: o.id,
          referenceType: 'ORDER',
          transactionDate: refundDate,
        });
        transactions.push(refund);
      }
    }
  }

  await transactionRepo.save(transactions);

  console.log('📉 Seeding expenses...');
  // Generate some monthly expenses
  const categories = [
    'MARKETING',
    'SOFTWARE',
    'PAYROLL',
    'LOGISTICS',
    'OFFICE',
  ];
  for (let m = 0; m < 6; m++) {
    for (const cat of categories) {
      const expenseDate = new Date(
        now.getFullYear(),
        now.getMonth() - m,
        faker.number.int({ min: 1, max: 28 }),
      );
      const amount = parseFloat(
        faker.finance.amount({ min: 100, max: 2000, dec: 2 }),
      );
      const exp = expenseRepo.create({
        category: cat,
        amount,
        expenseDate,
        description: `${cat} expense for ${expenseDate.toLocaleString('default', { month: 'long' })}`,
      });
      expenses.push(exp);
    }
  }

  await expenseRepo.save(expenses);

  await AppDataSource.destroy();
  console.log(
    '✨ Dummy data for Revenue & Financial Reports seeded successfully!',
  );
}

seedReports().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
