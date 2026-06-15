import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SalesReportService {
  constructor(private readonly dataSource: DataSource) {}

  async getReport(dateFrom?: string, dateTo?: string) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        `DATE(o.created_at) as "date"`,
        `COUNT(o.id) as "totalOrders"`,
        `COALESCE(SUM(o.total_amount), 0) as "totalRevenue"`,
        `COALESCE(AVG(o.total_amount), 0) as "averageOrderValue"`,
      ])
      .from('orders', 'o')
      .where('o.status NOT IN (:...excluded)', { excluded: ['CANCELLED'] });

    if (dateFrom) qb.andWhere('o.created_at >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('o.created_at <= :dateTo', { dateTo });

    qb.groupBy('DATE(o.created_at)');
    qb.orderBy('DATE(o.created_at)', 'DESC');

    const rows = await qb.getRawMany();
    return { data: rows };
  }
}
