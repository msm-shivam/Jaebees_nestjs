import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FinancialTransaction } from '../entities/financial-transaction.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { CreateTransactionDto } from '../dto/create-transaction.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinancialTransaction)
    private readonly transactionRepo: Repository<FinancialTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateTransactionDto): Promise<FinancialTransaction> {
    const transactionNumber = await this.generateTransactionNumber();
    const transaction = this.transactionRepo.create({
      ...dto,
      transactionNumber,
    });
    return this.transactionRepo.save(transaction);
  }

  async findAll(query: { page?: number; limit?: number; type?: TransactionType; dateFrom?: string; dateTo?: string }) {
    const qb = this.transactionRepo.createQueryBuilder('t')
      .orderBy('t.createdAt', 'DESC');

    if (query.type) qb.andWhere('t.type = :type', { type: query.type });
    if (query.dateFrom) qb.andWhere('t.transaction_date >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo) qb.andWhere('t.transaction_date <= :dateTo', { dateTo: query.dateTo });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<FinancialTransaction> {
    const transaction = await this.transactionRepo.findOne({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async getRevenue(dateFrom?: string, dateTo?: string) {
    const qb = this.transactionRepo.createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .addSelect('COUNT(t.id)', 'count')
      .where('t.type = :type', { type: TransactionType.ORDER_PAYMENT })
      .andWhere('t.status = :status', { status: 'COMPLETED' });

    if (dateFrom) qb.andWhere('t.transaction_date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('t.transaction_date <= :dateTo', { dateTo });

    return qb.getRawOne();
  }

  async getTotalRefunds(dateFrom?: string, dateTo?: string) {
    const qb = this.transactionRepo.createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .addSelect('COUNT(t.id)', 'count')
      .where('t.type = :type', { type: TransactionType.REFUND });

    if (dateFrom) qb.andWhere('t.transaction_date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('t.transaction_date <= :dateTo', { dateTo });

    return qb.getRawOne();
  }

  private async generateTransactionNumber(): Promise<string> {
    const result = await this.dataSource.query(
      `INSERT INTO finance_sequence_counters (locked, last_number) VALUES (1, 0)
       ON CONFLICT (locked) DO UPDATE SET last_number = finance_sequence_counters.last_number + 1
       RETURNING last_number`,
    );
    const nextNum = result[0]?.last_number ?? 1;
    return `FIN-${new Date().getFullYear()}-${String(nextNum).padStart(6, '0')}`;
  }
}
