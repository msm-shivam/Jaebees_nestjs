import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReturnReportService {
  constructor(private readonly dataSource: DataSource) {}

  async getReport(dateFrom?: string, dateTo?: string) {
    const qb = this.dataSource.createQueryBuilder()
      .select([
        'COUNT(*)::int as "totalReturns"',
        `COUNT(CASE WHEN r.status = 'COMPLETED' OR r.status = 'REFUNDED' THEN 1 END)::int as "completedReturns"`,
        `COUNT(CASE WHEN r.status = 'REQUESTED' THEN 1 END)::int as "pendingReturns"`,
        'COALESCE(SUM(r.total_refund_amount), 0) as "totalRefunded"',
        `CASE WHEN COUNT(*) > 0 THEN ROUND(COUNT(CASE WHEN r.status IN ('COMPLETED','REFUNDED') THEN 1 END)::decimal / COUNT(*) * 100, 2) ELSE 0 END as "returnRate"`,
      ])
      .from('return_requests', 'r');

    if (dateFrom) qb.andWhere('r.created_at >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('r.created_at <= :dateTo', { dateTo });

    const summary = await qb.getRawOne();

    const byReason = await this.dataSource.createQueryBuilder()
      .select([
        'r.reason as "reason"',
        'COUNT(*)::int as "count"',
        'COALESCE(SUM(r.total_refund_amount), 0) as "totalRefunded"',
      ])
      .from('return_requests', 'r');

    if (dateFrom) byReason.andWhere('r.created_at >= :dateFrom', { dateFrom });
    if (dateTo) byReason.andWhere('r.created_at <= :dateTo', { dateTo });

    byReason.groupBy('r.reason').orderBy('"count"', 'DESC');

    const reasons = await byReason.getRawMany();

    return {
      data: {
        totalReturns: parseInt(summary?.totalReturns ?? '0', 10),
        completedReturns: parseInt(summary?.completedReturns ?? '0', 10),
        pendingReturns: parseInt(summary?.pendingReturns ?? '0', 10),
        totalRefunded: parseFloat(summary?.totalRefunded ?? '0'),
        returnRate: parseFloat(summary?.returnRate ?? '0'),
        byReason: reasons ?? [],
      },
    };
  }
}
