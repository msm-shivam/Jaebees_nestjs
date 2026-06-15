import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialTransaction } from '../entities/financial-transaction.entity';
import { LedgerEntry } from '../entities/ledger-entry.entity';
import { Settlement } from '../entities/settlement.entity';
import { ExpenseRecord } from '../entities/expense-record.entity';
import { TaxRecord } from '../entities/tax-record.entity';
import { TransactionType } from '../enums/transaction-type.enum';

@Injectable()
export class FinancialReportService {
  constructor(
    @InjectRepository(FinancialTransaction)
    private readonly transactionRepo: Repository<FinancialTransaction>,
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepo: Repository<LedgerEntry>,
    @InjectRepository(Settlement)
    private readonly settlementRepo: Repository<Settlement>,
    @InjectRepository(ExpenseRecord)
    private readonly expenseRepo: Repository<ExpenseRecord>,
    @InjectRepository(TaxRecord)
    private readonly taxRepo: Repository<TaxRecord>,
  ) {}

  async getProfitLoss(dateFrom?: string, dateTo?: string) {
    const revenue = await this.transactionRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.type = :type', { type: TransactionType.ORDER_PAYMENT })
      .andWhere('t.status = :status', { status: 'COMPLETED' })
      .andWhere('t.transaction_date >= :dateFrom', {
        dateFrom: dateFrom || '1970-01-01',
      })
      .andWhere('t.transaction_date <= :dateTo', {
        dateTo: dateTo || '9999-12-31',
      })
      .getRawOne();

    const refunds = await this.transactionRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.type = :type', { type: TransactionType.REFUND })
      .andWhere('t.transaction_date >= :dateFrom', {
        dateFrom: dateFrom || '1970-01-01',
      })
      .andWhere('t.transaction_date <= :dateTo', {
        dateTo: dateTo || '9999-12-31',
      })
      .getRawOne();

    const expenses = await this.expenseRepo
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.amount), 0)', 'total')
      .where('e.expense_date >= :dateFrom', {
        dateFrom: dateFrom || '1970-01-01',
      })
      .andWhere('e.expense_date <= :dateTo', { dateTo: dateTo || '9999-12-31' })
      .getRawOne();

    const grossRevenue = parseFloat(revenue.total) || 0;
    const totalRefunds = parseFloat(refunds.total) || 0;
    const totalExpenses = parseFloat(expenses.total) || 0;
    const netProfit = grossRevenue - totalRefunds - totalExpenses;

    return {
      grossRevenue,
      totalRefunds,
      totalExpenses,
      netProfit,
    };
  }

  async getRevenueReport(dateFrom?: string, dateTo?: string) {
    const qb = this.transactionRepo
      .createQueryBuilder('t')
      .select("DATE_TRUNC('day', t.transaction_date)", 'date')
      .addSelect('COALESCE(SUM(t.amount), 0)', 'revenue')
      .addSelect('COUNT(t.id)', 'transactions')
      .where('t.type = :type', { type: TransactionType.ORDER_PAYMENT })
      .andWhere('t.status = :status', { status: 'COMPLETED' });

    if (dateFrom) qb.andWhere('t.transaction_date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('t.transaction_date <= :dateTo', { dateTo });

    qb.groupBy("DATE_TRUNC('day', t.transaction_date)").orderBy('date', 'DESC');

    return qb.getRawMany();
  }

  async getExpenseReport(dateFrom?: string, dateTo?: string) {
    const qb = this.expenseRepo
      .createQueryBuilder('e')
      .select('e.category', 'category')
      .addSelect('COALESCE(SUM(e.amount), 0)', 'total')
      .addSelect('COUNT(e.id)', 'count');

    if (dateFrom) qb.andWhere('e.expense_date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('e.expense_date <= :dateTo', { dateTo });

    qb.groupBy('e.category').orderBy('total', 'DESC');

    return qb.getRawMany();
  }

  async getSettlementReport(dateFrom?: string, dateTo?: string) {
    const qb = this.settlementRepo
      .createQueryBuilder('s')
      .select('s.status', 'status')
      .addSelect('COALESCE(SUM(s.amount), 0)', 'total')
      .addSelect('COUNT(s.id)', 'count');

    if (dateFrom) qb.andWhere('s.settlement_date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('s.settlement_date <= :dateTo', { dateTo });

    qb.groupBy('s.status');

    return qb.getRawMany();
  }

  async getDashboard() {
    const totalRevenue = await this.transactionRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.type = :type', { type: TransactionType.ORDER_PAYMENT })
      .andWhere('t.status = :status', { status: 'COMPLETED' })
      .getRawOne();

    const totalRefunds = await this.transactionRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.type = :type', { type: TransactionType.REFUND })
      .getRawOne();

    const totalExpenses = await this.expenseRepo
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.amount), 0)', 'total')
      .getRawOne();

    const pendingSettlements = await this.settlementRepo
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s.amount), 0)', 'total')
      .where('s.status = :status', { status: 'PENDING' })
      .getRawOne();

    const totalTaxCollected = await this.taxRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.tax_amount), 0)', 'total')
      .getRawOne();

    const transactionCount = await this.transactionRepo.count();

    const grossRevenue = parseFloat(totalRevenue.total) || 0;
    const grossRefunds = parseFloat(totalRefunds.total) || 0;
    const grossExpenses = parseFloat(totalExpenses.total) || 0;

    return {
      totalRevenue: grossRevenue,
      totalRefunds: grossRefunds,
      totalExpenses: grossExpenses,
      netProfit: grossRevenue - grossRefunds - grossExpenses,
      pendingSettlements: parseFloat(pendingSettlements.total) || 0,
      totalTaxCollected: parseFloat(totalTaxCollected.total) || 0,
      totalTransactions: transactionCount,
    };
  }
}
