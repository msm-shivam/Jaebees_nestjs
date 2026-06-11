import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxRecord } from '../entities/tax-record.entity';

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(TaxRecord)
    private readonly taxRepo: Repository<TaxRecord>,
  ) {}

  async recordTax(data: {
    orderId: string;
    taxableAmount: number;
    taxAmount: number;
    taxRate: number;
    taxType: string;
  }): Promise<TaxRecord> {
    const record = this.taxRepo.create(data);
    return this.taxRepo.save(record);
  }

  async getSummary(dateFrom?: string, dateTo?: string) {
    const qb = this.taxRepo.createQueryBuilder('t')
      .select('COALESCE(SUM(t.tax_amount), 0)', 'totalTaxCollected')
      .addSelect('COALESCE(SUM(t.taxable_amount), 0)', 'totalTaxableAmount')
      .addSelect('COUNT(t.id)', 'totalTransactions');

    if (dateFrom) qb.andWhere('t.tax_date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('t.tax_date <= :dateTo', { dateTo });

    return qb.getRawOne();
  }

  async getReports(query: { page?: number; limit?: number; dateFrom?: string; dateTo?: string; taxType?: string }) {
    const qb = this.taxRepo.createQueryBuilder('t')
      .leftJoinAndSelect('t.order', 'order')
      .orderBy('t.createdAt', 'DESC');

    if (query.taxType) qb.andWhere('t.tax_type = :taxType', { taxType: query.taxType });
    if (query.dateFrom) qb.andWhere('t.tax_date >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo) qb.andWhere('t.tax_date <= :dateTo', { dateTo: query.dateTo });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }
}
