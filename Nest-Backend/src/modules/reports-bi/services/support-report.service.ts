import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SupportReportService {
  constructor(private readonly dataSource: DataSource) {}

  async getReport(dateFrom?: string, dateTo?: string) {
    const params: Record<string, unknown> = {};
    let whereClause = '';
    if (dateFrom) {
      whereClause += ' AND t.created_at >= :dateFrom';
      params.dateFrom = dateFrom;
    }
    if (dateTo) {
      whereClause += ' AND t.created_at <= :dateTo';
      params.dateTo = dateTo;
    }

    const summary = await this.dataSource.query(
      `
      SELECT
        COUNT(*)::int as "totalTickets",
        COUNT(CASE WHEN t.status = 'OPEN' THEN 1 END)::int as "openTickets",
        COUNT(CASE WHEN t.status = 'RESOLVED' THEN 1 END)::int as "resolvedTickets",
        COUNT(CASE WHEN t.status = 'CLOSED' THEN 1 END)::int as "closedTickets",
        ROUND(COALESCE(AVG(CASE WHEN t.resolved_at IS NOT NULL THEN EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 3600 END), 0), 2) as "avgResolutionHours",
        CASE WHEN COUNT(*) > 0
          THEN ROUND(COUNT(CASE WHEN t.status IN ('RESOLVED','CLOSED') THEN 1 END)::decimal / COUNT(*) * 100, 2)
          ELSE 0 END as "resolutionRate"
      FROM "support_tickets" t
      WHERE 1=1 ${whereClause}
    `,
      params,
    );

    const byPriority = await this.dataSource.query(
      `
      SELECT t.priority as "priority", COUNT(*)::int as "count"
      FROM "support_tickets" t WHERE 1=1 ${whereClause}
      GROUP BY t.priority ORDER BY t.priority
    `,
      params,
    );

    const row = summary[0];
    return {
      data: {
        totalTickets: parseInt(row?.totalTickets ?? '0', 10),
        openTickets: parseInt(row?.openTickets ?? '0', 10),
        resolvedTickets: parseInt(row?.resolvedTickets ?? '0', 10),
        closedTickets: parseInt(row?.closedTickets ?? '0', 10),
        avgResolutionHours: parseFloat(row?.avgResolutionHours ?? '0'),
        resolutionRate: parseFloat(row?.resolutionRate ?? '0'),
        byPriority: byPriority ?? [],
      },
    };
  }
}
