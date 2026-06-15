import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CustomerReportService {
  constructor(private readonly dataSource: DataSource) {}

  async getReport(dateFrom?: string, dateTo?: string) {
    const baseCondition =
      dateFrom || dateTo
        ? `WHERE o.created_at ${dateFrom ? '>= :dateFrom' : ''}${dateFrom && dateTo ? ' AND ' : ''}${dateTo ? '<= :dateTo' : ''}`
        : '';

    const params: Record<string, unknown> = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    const [newCustomers, repeatCustomers, topSpenders, totalCustomers] =
      await Promise.all([
        this.dataSource.query(
          `SELECT COUNT(*)::int as "count" FROM "users" u ${baseCondition.replace('o.created_at', 'u.created_at')}`,
          params,
        ),
        this.dataSource.query(
          `
        SELECT COUNT(*)::int as "count" FROM (
          SELECT o.customer_id FROM "orders" o
          WHERE o.status NOT IN ('CANCELLED')
          ${dateFrom ? 'AND o.created_at >= :dateFrom' : ''}
          ${dateTo ? 'AND o.created_at <= :dateTo' : ''}
          GROUP BY o.customer_id HAVING COUNT(o.id) > 1
        ) repeat
      `,
          params,
        ),
        this.dataSource.query(
          `
        SELECT o.customer_id as "customerId", u.first_name || ' ' || u.last_name as "customerName",
               COUNT(o.id) as "orderCount", COALESCE(SUM(o.total_amount), 0) as "totalSpent"
        FROM "orders" o
        LEFT JOIN "users" u ON u.id = o.customer_id
        WHERE o.status NOT IN ('CANCELLED')
        ${dateFrom ? 'AND o.created_at >= :dateFrom' : ''}
        ${dateTo ? 'AND o.created_at <= :dateTo' : ''}
        GROUP BY o.customer_id, u.first_name, u.last_name
        ORDER BY "totalSpent" DESC LIMIT 10
      `,
          params,
        ),
        this.dataSource.query(
          'SELECT COUNT(*)::int as "count" FROM "users"',
          [],
        ),
      ]);

    return {
      data: {
        newCustomers: parseInt(newCustomers[0]?.count ?? '0', 10),
        repeatCustomers: parseInt(repeatCustomers[0]?.count ?? '0', 10),
        topSpenders: topSpenders ?? [],
        totalCustomers: parseInt(totalCustomers[0]?.count ?? '0', 10),
      },
    };
  }
}
