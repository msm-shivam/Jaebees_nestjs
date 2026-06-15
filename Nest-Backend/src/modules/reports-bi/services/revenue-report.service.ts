import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class RevenueReportService {
  constructor(private readonly dataSource: DataSource) {}

  async getReport(dateFrom?: string, dateTo?: string) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        `DATE_TRUNC('month', o.created_at) as "month"`,
        `COUNT(o.id) as "totalOrders"`,
        `COALESCE(SUM(o.total_amount), 0) as "grossRevenue"`,
        `COALESCE(SUM(o.discount_amount), 0) as "discounts"`,
        `COALESCE(SUM(o.total_amount) - COALESCE(SUM(o.discount_amount), 0), 0) as "netRevenue"`,
      ])
      .from('orders', 'o')
      .where('o.status NOT IN (:...excluded)', { excluded: ['CANCELLED'] });

    if (dateFrom) qb.andWhere('o.created_at >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('o.created_at <= :dateTo', { dateTo });

    qb.groupBy(`DATE_TRUNC('month', o.created_at)`);
    qb.orderBy(`DATE_TRUNC('month', o.created_at)`, 'DESC');

    const rows = await qb.getRawMany();
    return { data: rows };
  }
}
