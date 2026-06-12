import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class MarketingReportService {
  constructor(private readonly dataSource: DataSource) {}

  async getReport(dateFrom?: string, dateTo?: string) {
    const params: Record<string, unknown> = {};
    let whereClause = '';
    if (dateFrom) { whereClause += ' AND c.created_at >= :dateFrom'; params.dateFrom = dateFrom; }
    if (dateTo) { whereClause += ' AND c.created_at <= :dateTo'; params.dateTo = dateTo; }

    const [couponUsage, campaigns] = await Promise.all([
      this.dataSource.query(`
        SELECT
          COUNT(DISTINCT cu.coupon_id)::int as "activeCoupons",
          COUNT(cu.id)::int as "totalUses",
          COALESCE(SUM(cu.discount_amount), 0) as "totalDiscountGiven"
        FROM "coupon_usage" cu
        LEFT JOIN "coupons" c ON c.id = cu.coupon_id
        WHERE 1=1 ${whereClause}
      `, params),
      this.dataSource.query(`
        SELECT
          COUNT(*)::int as "totalCampaigns",
          COUNT(CASE WHEN c.status = 'SENDING' THEN 1 END)::int as "activeCampaigns",
          COALESCE(SUM(c.opens_count), 0)::int as "totalOpens",
          COALESCE(SUM(c.clicks_count), 0)::int as "totalClicks",
          CASE WHEN COALESCE(SUM(c.opens_count), 0) > 0
            THEN ROUND(COALESCE(SUM(c.clicks_count), 0)::decimal / NULLIF(SUM(c.opens_count), 0) * 100, 2)
            ELSE 0 END as "clickRate"
        FROM "email_campaigns" c
        WHERE 1=1 ${whereClause}
      `, params),
    ]);

    return {
      data: {
        couponUsage: couponUsage[0] ?? { activeCoupons: 0, totalUses: 0, totalDiscountGiven: 0 },
        campaigns: campaigns[0] ?? { totalCampaigns: 0, activeCampaigns: 0, totalOpens: 0, totalClicks: 0, clickRate: 0 },
      },
    };
  }
}
