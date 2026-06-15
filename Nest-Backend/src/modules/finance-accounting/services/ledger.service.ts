import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LedgerEntry } from '../entities/ledger-entry.entity';
import { FinancialTransaction } from '../entities/financial-transaction.entity';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepo: Repository<LedgerEntry>,
    @InjectRepository(FinancialTransaction)
    private readonly transactionRepo: Repository<FinancialTransaction>,
  ) {}

  async createEntry(data: {
    transactionId: string;
    accountCode: string;
    accountName: string;
    debitAmount?: number;
    creditAmount?: number;
    description?: string;
  }): Promise<LedgerEntry> {
    const entry = this.ledgerRepo.create(data);
    return this.ledgerRepo.save(entry);
  }

  async recordDoubleEntry(
    transactionId: string,
    debitAccount: { code: string; name: string; amount: number },
    creditAccount: { code: string; name: string; amount: number },
    description?: string,
  ): Promise<[LedgerEntry, LedgerEntry]> {
    const debit = await this.createEntry({
      transactionId,
      accountCode: debitAccount.code,
      accountName: debitAccount.name,
      debitAmount: debitAccount.amount,
      description,
    });
    const credit = await this.createEntry({
      transactionId,
      accountCode: creditAccount.code,
      accountName: creditAccount.name,
      creditAmount: creditAccount.amount,
      description,
    });
    return [debit, credit];
  }

  async findByTransaction(transactionId: string): Promise<LedgerEntry[]> {
    return this.ledgerRepo.find({
      where: { transactionId },
      order: { createdAt: 'ASC' },
    });
  }

  async findByAccount(
    accountCode: string,
    query: {
      page?: number;
      limit?: number;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    const qb = this.ledgerRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.transaction', 'transaction')
      .where('l.account_code = :accountCode', { accountCode })
      .orderBy('l.createdAt', 'DESC');

    if (query.dateFrom)
      qb.andWhere('l.entry_date >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo)
      qb.andWhere('l.entry_date <= :dateTo', { dateTo: query.dateTo });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const qb = this.ledgerRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.transaction', 'transaction')
      .orderBy('l.createdAt', 'DESC');

    if (query.dateFrom)
      qb.andWhere('l.entry_date >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo)
      qb.andWhere('l.entry_date <= :dateTo', { dateTo: query.dateTo });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }
}
