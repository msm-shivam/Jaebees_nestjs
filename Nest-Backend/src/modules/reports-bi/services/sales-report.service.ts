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
    const mappedRows = rows.map((r) => ({
      date: r.date,
      totalOrders: parseInt(r.totalOrders, 10),
      totalRevenue: parseFloat(r.totalRevenue),
      averageOrderValue: parseFloat(r.averageOrderValue),
    }));

    // Summary totals
    const summaryQb = this.dataSource
      .createQueryBuilder()
      .select([
        `COALESCE(SUM(o.total_amount), 0) as "totalRevenue"`,
        `COUNT(o.id) as "totalOrders"`,
        `COALESCE(AVG(o.total_amount), 0) as "averageOrderValue"`,
      ])
      .from('orders', 'o')
      .where('o.status NOT IN (:...excluded)', { excluded: ['CANCELLED'] });

    if (dateFrom) summaryQb.andWhere('o.created_at >= :dateFrom', { dateFrom });
    if (dateTo) summaryQb.andWhere('o.created_at <= :dateTo', { dateTo });

    const summary = await summaryQb.getRawOne();

    // Return rate: RETURNED + RETURN_REQUESTED / total (including CANCELLED)
    const returnQb = this.dataSource
      .createQueryBuilder()
      .select(`COUNT(o.id) as "returned"`)
      .from('orders', 'o')
      .where("o.status IN ('RETURNED','RETURN_REQUESTED')");
    if (dateFrom) returnQb.andWhere('o.created_at >= :dateFrom', { dateFrom });
    if (dateTo) returnQb.andWhere('o.created_at <= :dateTo', { dateTo });

    const totalQb = this.dataSource
      .createQueryBuilder()
      .select(`COUNT(o.id) as "total"`)
      .from('orders', 'o');
    if (dateFrom) totalQb.andWhere('o.created_at >= :dateFrom', { dateFrom });
    if (dateTo) totalQb.andWhere('o.created_at <= :dateTo', { dateTo });

    const [returnResult, totalResult] = await Promise.all([
      returnQb.getRawOne(),
      totalQb.getRawOne(),
    ]);

    const totalOrdersAll = parseInt(totalResult?.total ?? '0', 10);
    const returned = parseInt(returnResult?.returned ?? '0', 10);
    const returnRate = totalOrdersAll > 0
      ? Math.round((returned / totalOrdersAll) * 10000) / 100
      : 0;

    return {
      sales: mappedRows,
      totalRevenue: parseFloat(summary?.totalRevenue ?? '0'),
      totalOrders: parseInt(summary?.totalOrders ?? '0', 10),
      averageOrderValue: parseFloat(summary?.averageOrderValue ?? '0'),
      returnRate,
    };
  }
}
