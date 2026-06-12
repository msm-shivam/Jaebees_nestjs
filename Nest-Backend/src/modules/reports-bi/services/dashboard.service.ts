import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DashboardType } from '../enums/dashboard-type.enum';
import { DashboardSnapshot } from '../entities/dashboard-snapshot.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(DashboardSnapshot)
    private readonly snapshotRepo: Repository<DashboardSnapshot>,
  ) {}

  async getMain() {
    const [
      ordersResult,
      customersResult,
      productsResult,
      refundsResult,
      returnsResult,
      ticketsResult,
      lowStockResult,
      couponsResult,
      campaignsResult,
    ] = await Promise.all([
      this.dataSource.query(`SELECT COUNT(*)::int as "total", COALESCE(SUM(total_amount),0) as "revenue" FROM "orders" WHERE status NOT IN ('CANCELLED')`),
      this.dataSource.query(`SELECT COUNT(*)::int as "total" FROM "users"`),
      this.dataSource.query(`SELECT COUNT(*)::int as "total" FROM "products" WHERE is_active = true`),
      this.dataSource.query(`SELECT COALESCE(SUM(total_refund_amount),0) as "total" FROM "return_requests" WHERE status IN ('COMPLETED','REFUNDED')`),
      this.dataSource.query(`SELECT COUNT(*)::int as "total" FROM "return_requests" WHERE status = 'REQUESTED'`),
      this.dataSource.query(`SELECT COUNT(*)::int as "total" FROM "support_tickets" WHERE status = 'OPEN'`),
      this.dataSource.query(`SELECT COUNT(*)::int as "total" FROM "inventories" WHERE quantity <= low_stock_threshold AND quantity > 0`),
      this.dataSource.query(`SELECT COUNT(*)::int as "total" FROM "coupons" WHERE is_active = true`),
      this.dataSource.query(`SELECT COUNT(*)::int as "total" FROM "email_campaigns" WHERE status = 'SENDING'`),
    ]);

    const metrics = {
      totalOrders: parseInt(ordersResult[0]?.total ?? '0', 10),
      totalRevenue: parseFloat(ordersResult[0]?.revenue ?? '0'),
      totalCustomers: parseInt(customersResult[0]?.total ?? '0', 10),
      totalProducts: parseInt(productsResult[0]?.total ?? '0', 10),
      totalRefunds: parseFloat(refundsResult[0]?.total ?? '0'),
      pendingReturns: parseInt(returnsResult[0]?.total ?? '0', 10),
      openSupportTickets: parseInt(ticketsResult[0]?.total ?? '0', 10),
      lowStockProducts: parseInt(lowStockResult[0]?.total ?? '0', 10),
      activeCoupons: parseInt(couponsResult[0]?.total ?? '0', 10),
      activeCampaigns: parseInt(campaignsResult[0]?.total ?? '0', 10),
    };

    await this.saveSnapshot(DashboardType.MAIN, metrics as Record<string, unknown>);
    return { data: metrics };
  }

  async getFinance() {
    const [revenue, refunds, expenses, tax, settlements] = await Promise.all([
      this.dataSource.query(`SELECT COALESCE(SUM(total_amount),0) as "gross" FROM "orders" WHERE status NOT IN ('CANCELLED')`),
      this.dataSource.query(`SELECT COALESCE(SUM(total_refund_amount),0) as "total" FROM "return_requests" WHERE status IN ('COMPLETED','REFUNDED')`),
      this.dataSource.query(`SELECT COALESCE(SUM(amount),0) as "total" FROM "expense_records"`),
      this.dataSource.query(`SELECT COALESCE(SUM(tax_amount),0) as "total" FROM "tax_records"`),
      this.dataSource.query(`SELECT COUNT(*)::int as "total" FROM "settlements" WHERE status = 'PENDING'`),
    ]);

    const grossRevenue = parseFloat(revenue[0]?.gross ?? '0');
    const refundAmount = parseFloat(refunds[0]?.total ?? '0');
    const expenseAmount = parseFloat(expenses[0]?.total ?? '0');
    const netRevenue = grossRevenue - refundAmount;
    const profit = netRevenue - expenseAmount;

    const metrics = {
      grossRevenue,
      netRevenue,
      refundAmount,
      expenseAmount,
      profit,
      taxCollected: parseFloat(tax[0]?.total ?? '0'),
      pendingSettlements: parseInt(settlements[0]?.total ?? '0', 10),
    };

    await this.saveSnapshot(DashboardType.FINANCE, metrics as Record<string, unknown>);
    return { data: metrics };
  }

  async getInventory() {
    const [stockValue, lowStock, outOfStock, purchaseOrders, goodsReceipts] = await Promise.all([
      this.dataSource.query(`SELECT COALESCE(SUM(i.quantity * COALESCE(pv.cost_price, 0)), 0) as "total" FROM "inventories" i LEFT JOIN "product_variants" pv ON pv.id = i.variant_id`),
      this.dataSource.query(`SELECT COUNT(*)::int as "total" FROM "inventories" WHERE quantity <= low_stock_threshold AND quantity > 0`),
      this.dataSource.query(`SELECT COUNT(*)::int as "total" FROM "inventories" WHERE quantity = 0`),
      this.dataSource.query(`SELECT COUNT(*)::int as "total" FROM "purchase_orders" WHERE status IN ('APPROVED','PARTIALLY_RECEIVED')`),
      this.dataSource.query(`SELECT COUNT(*)::int as "total" FROM "purchase_orders" WHERE status = 'APPROVED'`),
    ]);

    const metrics = {
      totalInventoryValue: parseFloat(stockValue[0]?.total ?? '0'),
      lowStockItems: parseInt(lowStock[0]?.total ?? '0', 10),
      outOfStockItems: parseInt(outOfStock[0]?.total ?? '0', 10),
      activePurchaseOrders: parseInt(purchaseOrders[0]?.total ?? '0', 10),
      pendingGoodsReceipts: parseInt(goodsReceipts[0]?.total ?? '0', 10),
    };

    await this.saveSnapshot(DashboardType.INVENTORY, metrics as Record<string, unknown>);
    return { data: metrics };
  }

  async getSupport() {
    const [tickets, slaResult] = await Promise.all([
      this.dataSource.query(`
        SELECT
          COUNT(*)::int as "total",
          COUNT(CASE WHEN status = 'OPEN' THEN 1 END)::int as "open",
          COUNT(CASE WHEN status = 'ASSIGNED' THEN 1 END)::int as "assigned",
          COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END)::int as "resolved"
        FROM "support_tickets"
      `),
      this.dataSource.query(`
        SELECT
          ROUND(COALESCE(AVG(
            CASE WHEN sla_status = 'BREACHED' THEN 0 ELSE 1 END
          ) * 100, 0), 2) as "slaCompliance"
        FROM "ticket_sla_logs"
      `),
    ]);

    const metrics = {
      openTickets: parseInt(tickets[0]?.open ?? '0', 10),
      assignedTickets: parseInt(tickets[0]?.assigned ?? '0', 10),
      resolvedTickets: parseInt(tickets[0]?.resolved ?? '0', 10),
      avgResponseTime: 0,
      avgResolutionTime: 0,
      slaComplianceRate: parseFloat(slaResult[0]?.slaCompliance ?? '0'),
    };

    await this.saveSnapshot(DashboardType.SUPPORT, metrics as Record<string, unknown>);
    return { data: metrics };
  }

  async getMarketing() {
    const [campaigns, emails, couponUsage] = await Promise.all([
      this.dataSource.query(`
        SELECT
          COUNT(*)::int as "total",
          COUNT(CASE WHEN status = 'SENDING' THEN 1 END)::int as "active",
          COALESCE(SUM(opens_count), 0)::int as "opens",
          COALESCE(SUM(clicks_count), 0)::int as "clicks"
        FROM "email_campaigns"
      `),
      this.dataSource.query(`SELECT COUNT(*)::int as "sent" FROM "email_notifications"`),
      this.dataSource.query(`SELECT COUNT(*)::int as "uses" FROM "coupon_usage"`),
    ]);

    const totalOpens = parseInt(campaigns[0]?.opens ?? '0', 10);
    const totalClicks = parseInt(campaigns[0]?.clicks ?? '0', 10);

    const metrics = {
      activeCampaigns: parseInt(campaigns[0]?.active ?? '0', 10),
      emailsSent: parseInt(emails[0]?.sent ?? '0', 10),
      openRate: totalOpens > 0 ? parseFloat((totalClicks / totalOpens * 100).toFixed(2)) : 0,
      clickRate: totalOpens > 0 ? parseFloat((totalClicks / totalOpens * 100).toFixed(2)) : 0,
      couponUsage: parseInt(couponUsage[0]?.uses ?? '0', 10),
      promotionUsage: 0,
    };

    await this.saveSnapshot(DashboardType.MARKETING, metrics as Record<string, unknown>);
    return { data: metrics };
  }

  private async saveSnapshot(dashboardType: DashboardType, metrics: Record<string, unknown>) {
    const snapshot = this.snapshotRepo.create({
      snapshotDate: new Date(),
      dashboardType,
      metricsJson: metrics,
    });
    await this.snapshotRepo.save(snapshot).catch(() => {});
  }
}
