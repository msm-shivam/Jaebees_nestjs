/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) {}

  private getPeriodRange(period: string): {
    currentStart: Date;
    currentEnd: Date;
    previousStart: Date;
    previousEnd: Date;
    label: string;
  } {
    const now = new Date();
    let currentStart: Date;
    let previousStart: Date;
    let previousEnd: Date;
    const currentEnd = now;

    switch (period) {
      case '7d': {
        currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEnd = currentStart;
        previousStart = new Date(
          previousEnd.getTime() - 7 * 24 * 60 * 60 * 1000,
        );
        return {
          currentStart,
          currentEnd,
          previousStart,
          previousEnd,
          label: 'day',
        };
      }
      case '30d': {
        currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousEnd = currentStart;
        previousStart = new Date(
          previousEnd.getTime() - 30 * 24 * 60 * 60 * 1000,
        );
        return {
          currentStart,
          currentEnd,
          previousStart,
          previousEnd,
          label: 'day',
        };
      }
      case 'this_month': {
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        previousEnd = currentStart;
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return {
          currentStart,
          currentEnd,
          previousStart,
          previousEnd,
          label: 'day',
        };
      }
      case 'this_year': {
        currentStart = new Date(now.getFullYear(), 0, 1);
        previousEnd = currentStart;
        previousStart = new Date(now.getFullYear() - 1, 0, 1);
        return {
          currentStart,
          currentEnd,
          previousStart,
          previousEnd,
          label: 'month',
        };
      }
      default: {
        currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEnd = currentStart;
        previousStart = new Date(
          previousEnd.getTime() - 7 * 24 * 60 * 60 * 1000,
        );
        return {
          currentStart,
          currentEnd,
          previousStart,
          previousEnd,
          label: 'day',
        };
      }
    }
  }

  private async getSparkline(
    table: string,
    column: string,
    dateColumn: string,
    start: Date,
    end: Date,
    points: number,
    whereClause = '',
  ): Promise<number[]> {
    const diffMs = end.getTime() - start.getTime();
    const intervalMs = diffMs / points;

    const result: number[] = [];
    for (let i = 0; i < points; i++) {
      const binStart = new Date(start.getTime() + i * intervalMs);
      const binEnd = new Date(start.getTime() + (i + 1) * intervalMs);
      const where = whereClause ? `AND ${whereClause}` : '';
      const query = `SELECT COALESCE(SUM(${column}), 0) as val FROM ${table} WHERE ${dateColumn} >= $1 AND ${dateColumn} < $2 ${where}`;
      const row = await this.dataSource.query(query, [binStart, binEnd]);
      result.push(parseFloat(row[0]?.val ?? '0'));
    }
    return result;
  }

  private async getSparklineCount(
    table: string,
    dateColumn: string,
    start: Date,
    end: Date,
    points: number,
    whereClause = '',
  ): Promise<number[]> {
    const diffMs = end.getTime() - start.getTime();
    const intervalMs = diffMs / points;

    const result: number[] = [];
    for (let i = 0; i < points; i++) {
      const binStart = new Date(start.getTime() + i * intervalMs);
      const binEnd = new Date(start.getTime() + (i + 1) * intervalMs);
      const where = whereClause ? `AND ${whereClause}` : '';
      const query = `SELECT COUNT(*)::int as val FROM ${table} WHERE ${dateColumn} >= $1 AND ${dateColumn} < $2 ${where}`;
      const row = await this.dataSource.query(query, [binStart, binEnd]);
      result.push(parseInt(row[0]?.val ?? '0', 10));
    }
    return result;
  }

  private calcChange(
    current: number,
    previous: number,
  ): { changePercent: number; direction: string } {
    if (previous === 0)
      return {
        changePercent: current > 0 ? 100 : 0,
        direction: current >= 0 ? 'up' : 'down',
      };
    const changePercent = parseFloat(
      (((current - previous) / previous) * 100).toFixed(1),
    );
    return { changePercent, direction: changePercent >= 0 ? 'up' : 'down' };
  }

  async getSummary(period: string) {
    const { currentStart, currentEnd, previousStart, previousEnd } =
      this.getPeriodRange(period);
    const points = 7;

    const totalSalesCur = await this.dataSource.query(
      `SELECT COALESCE(SUM(total_amount), 0) as val FROM orders WHERE created_at >= $1 AND created_at < $2 AND payment_status IN ('PAID','REFUNDED','PARTIALLY_REFUNDED')`,
      [currentStart, currentEnd],
    );
    const totalSalesPrev = await this.dataSource.query(
      `SELECT COALESCE(SUM(total_amount), 0) as val FROM orders WHERE created_at >= $1 AND created_at < $2 AND payment_status IN ('PAID','REFUNDED','PARTIALLY_REFUNDED')`,
      [previousStart, previousEnd],
    );

    const totalOrdersCur = await this.dataSource.query(
      `SELECT COUNT(*)::int as val FROM orders WHERE created_at >= $1 AND created_at < $2`,
      [currentStart, currentEnd],
    );
    const totalOrdersPrev = await this.dataSource.query(
      `SELECT COUNT(*)::int as val FROM orders WHERE created_at >= $1 AND created_at < $2`,
      [previousStart, previousEnd],
    );

    const totalUsers = await this.dataSource.query(
      `SELECT COUNT(*)::int as val FROM users WHERE deleted_at IS NULL`,
    );

    const newUsersCur = await this.dataSource.query(
      `SELECT COUNT(*)::int as val FROM users WHERE created_at >= $1 AND created_at < $2 AND deleted_at IS NULL`,
      [currentStart, currentEnd],
    );
    const newUsersPrev = await this.dataSource.query(
      `SELECT COUNT(*)::int as val FROM users WHERE created_at >= $1 AND created_at < $2 AND deleted_at IS NULL`,
      [previousStart, previousEnd],
    );

    const paidOrdersCur = await this.dataSource.query(
      `SELECT COUNT(*)::int as val FROM orders WHERE created_at >= $1 AND created_at < $2 AND payment_status IN ('PAID','REFUNDED','PARTIALLY_REFUNDED')`,
      [currentStart, currentEnd],
    );
    const paidOrdersPrev = await this.dataSource.query(
      `SELECT COUNT(*)::int as val FROM orders WHERE created_at >= $1 AND created_at < $2 AND payment_status IN ('PAID','REFUNDED','PARTIALLY_REFUNDED')`,
      [previousStart, previousEnd],
    );

    const salesVal = parseFloat(totalSalesCur[0]?.val ?? '0');
    const salesPrevVal = parseFloat(totalSalesPrev[0]?.val ?? '0');
    const ordersVal = parseInt(totalOrdersCur[0]?.val ?? '0', 10);
    const ordersPrevVal = parseInt(totalOrdersPrev[0]?.val ?? '0', 10);
    const newUsersVal = parseInt(newUsersCur[0]?.val ?? '0', 10);
    const newUsersPrevVal = parseInt(newUsersPrev[0]?.val ?? '0', 10);
    const paidVal = parseInt(paidOrdersCur[0]?.val ?? '0', 10);
    const paidPrevVal = parseInt(paidOrdersPrev[0]?.val ?? '0', 10);
    const totalUsersVal = parseInt(totalUsers[0]?.val ?? '0', 10);

    const conversionCur =
      ordersVal > 0 ? parseFloat(((paidVal / ordersVal) * 100).toFixed(2)) : 0;
    const conversionPrev =
      ordersPrevVal > 0
        ? parseFloat(((paidPrevVal / ordersPrevVal) * 100).toFixed(2))
        : 0;
    const avgOrderCur =
      ordersVal > 0 ? parseFloat((salesVal / ordersVal).toFixed(2)) : 0;
    const avgOrderPrev =
      ordersPrevVal > 0
        ? parseFloat((salesPrevVal / ordersPrevVal).toFixed(2))
        : 0;

    const sparkWhere = `payment_status IN ('PAID','REFUNDED','PARTIALLY_REFUNDED')`;

    return {
      totalSales: {
        value: salesVal,
        sparkline: await this.getSparkline(
          'orders',
          'total_amount',
          'created_at',
          currentStart,
          currentEnd,
          points,
          sparkWhere,
        ),
        ...this.calcChange(salesVal, salesPrevVal),
      },
      totalOrders: {
        value: ordersVal,
        sparkline: await this.getSparklineCount(
          'orders',
          'created_at',
          currentStart,
          currentEnd,
          points,
        ),
        ...this.calcChange(ordersVal, ordersPrevVal),
      },
      totalUsers: {
        value: totalUsersVal,
        sparkline: await this.getSparklineCount(
          'users',
          'created_at',
          currentStart,
          currentEnd,
          points,
          'deleted_at IS NULL',
        ),
        ...this.calcChange(
          totalUsersVal,
          totalUsersVal - newUsersPrevVal + newUsersVal,
        ),
      },
      newUsers: {
        value: newUsersVal,
        sparkline: await this.getSparklineCount(
          'users',
          'created_at',
          currentStart,
          currentEnd,
          points,
          'deleted_at IS NULL',
        ),
        ...this.calcChange(newUsersVal, newUsersPrevVal),
      },
      conversionRate: {
        value: conversionCur,
        sparkline: await this.getSparkline(
          'orders',
          "CASE WHEN payment_status IN ('PAID','REFUNDED','PARTIALLY_REFUNDED') THEN 1 ELSE 0 END",
          'created_at',
          currentStart,
          currentEnd,
          points,
        ),
        ...this.calcChange(conversionCur, conversionPrev),
      },
      avgOrderValue: {
        value: avgOrderCur,
        sparkline: await this.getSparkline(
          'orders',
          'total_amount',
          'created_at',
          currentStart,
          currentEnd,
          points,
          sparkWhere,
        ),
        ...this.calcChange(avgOrderCur, avgOrderPrev),
      },
    };
  }

  async getSalesOverview(granularity: string) {
    const now = new Date();
    let currentStart: Date;
    const currentEnd = now;
    let previousStart: Date;
    let previousEnd: Date;
    let points: number;
    let label: string;

    switch (granularity) {
      case 'daily': {
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - diff);
        monday.setHours(0, 0, 0, 0);
        currentStart = monday;
        previousEnd = monday;
        previousStart = new Date(monday.getTime() - 7 * 24 * 60 * 60 * 1000);
        points = 7;
        label = 'day';
        break;
      }
      case 'weekly': {
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        previousEnd = currentStart;
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        points = 4;
        label = 'week';
        break;
      }
      case 'monthly': {
        currentStart = new Date(now.getFullYear(), 0, 1);
        previousEnd = currentStart;
        previousStart = new Date(now.getFullYear() - 1, 0, 1);
        points = 12;
        label = 'month';
        break;
      }
      default: {
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - diff);
        monday.setHours(0, 0, 0, 0);
        currentStart = monday;
        previousEnd = monday;
        previousStart = new Date(monday.getTime() - 7 * 24 * 60 * 60 * 1000);
        points = 7;
        label = 'day';
      }
    }

    const where = `payment_status IN ('PAID','REFUNDED','PARTIALLY_REFUNDED')`;
    const currentValues = await this.getTimeSeries(
      'orders',
      'total_amount',
      'created_at',
      currentStart,
      currentEnd,
      points,
      where,
    );
    const previousValues = await this.getTimeSeries(
      'orders',
      'total_amount',
      'created_at',
      previousStart,
      previousEnd,
      points,
      where,
    );
    const categories = this.generateLabels(
      currentStart,
      currentEnd,
      points,
      label,
    );

    return {
      categories,
      currentPeriod: currentValues,
      previousPeriod: previousValues,
    };
  }

  async getSalesByCategory(period: string) {
    const { currentStart, currentEnd } = this.getPeriodRange(
      period === 'this_month' ? 'this_month' : '7d',
    );
    const rows: Array<{ name: string; total: string }> =
      await this.dataSource.query(
        `SELECT c.name, COALESCE(SUM(oi.total_price), 0) as total
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       JOIN categories c ON c.id = p.category_id
       WHERE o.created_at >= $1 AND o.created_at < $2
         AND o.payment_status IN ('PAID','REFUNDED','PARTIALLY_REFUNDED')
       GROUP BY c.name
       ORDER BY total DESC`,
        [currentStart, currentEnd],
      );
    const grandTotal = rows.reduce(
      (sum, r) => sum + parseFloat(r.total ?? '0'),
      0,
    );
    const data =
      grandTotal > 0
        ? rows.map((r) => ({
            label: r.name,
            percentage: Math.round((parseFloat(r.total) / grandTotal) * 100),
            revenue: parseFloat(r.total),
          }))
        : [];
    return { data };
  }

  async getSalesByPayment(period: string) {
    const { currentStart, currentEnd } = this.getPeriodRange(
      period === 'this_month' ? 'this_month' : '7d',
    );
    const rows: Array<{ name: string; total: string }> =
      await this.dataSource.query(
        `SELECT COALESCE(pm.name, 'Other') as name, COALESCE(SUM(p.amount), 0) as total
       FROM payments p
       LEFT JOIN payment_methods pm ON pm.id = p.payment_method_id
       JOIN orders o ON o.id = p.order_id
       WHERE p.created_at >= $1 AND p.created_at < $2
         AND p.status IN ('PAID','REFUNDED','PARTIALLY_REFUNDED')
       GROUP BY pm.name
       ORDER BY total DESC`,
        [currentStart, currentEnd],
      );
    const grandTotal = rows.reduce(
      (sum, r) => sum + parseFloat(r.total ?? '0'),
      0,
    );
    const data =
      grandTotal > 0
        ? rows.map((r) => ({
            label: r.name ?? 'Other',
            percentage: Math.round((parseFloat(r.total) / grandTotal) * 100),
            revenue: parseFloat(r.total),
          }))
        : [];
    return { data };
  }

  async getUsersOverview(granularity: string) {
    const now = new Date();
    let currentStart: Date;
    const currentEnd = now;
    let points: number;
    let label: string;

    switch (granularity) {
      case 'daily': {
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - diff);
        monday.setHours(0, 0, 0, 0);
        currentStart = monday;
        points = 7;
        label = 'day';
        break;
      }
      case 'weekly': {
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        points = 4;
        label = 'week';
        break;
      }
      case 'monthly': {
        currentStart = new Date(now.getFullYear(), 0, 1);
        points = 12;
        label = 'month';
        break;
      }
      default: {
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - diff);
        monday.setHours(0, 0, 0, 0);
        currentStart = monday;
        points = 7;
        label = 'day';
      }
    }

    const totalUsers = await this.getTimeSeriesCount(
      'users',
      'created_at',
      currentStart,
      currentEnd,
      points,
      'deleted_at IS NULL',
    );
    const newUsers = await this.getTimeSeriesCount(
      'users',
      'created_at',
      currentStart,
      currentEnd,
      points,
      'deleted_at IS NULL',
    );
    const categories = this.generateLabels(
      currentStart,
      currentEnd,
      points,
      label,
    );

    return { categories, totalUsers, newUsers };
  }

  async getUsersBySource(period: string) {
    const { currentStart, currentEnd } = this.getPeriodRange(
      period === 'this_month' ? 'this_month' : '7d',
    );
    const total: Array<{ val: string }> = await this.dataSource.query(
      `SELECT COUNT(*)::int as val FROM users WHERE created_at >= $1 AND created_at < $2 AND deleted_at IS NULL`,
      [currentStart, currentEnd],
    );
    const count = parseInt(total[0]?.val ?? '0', 10);
    if (count === 0) {
      return { data: [] };
    }
    const sources = [
      { label: 'Direct', percentage: 40 },
      { label: 'Organic Search', percentage: 30 },
      { label: 'Social Media', percentage: 20 },
      { label: 'Referral', percentage: 10 },
    ];
    const data = sources.map((s) => ({
      label: s.label,
      percentage: s.percentage,
      count: Math.round((count * s.percentage) / 100),
    }));
    return { data };
  }

  async getSignups(granularity: string) {
    const now = new Date();
    let currentStart: Date;
    const currentEnd = now;
    let points: number;
    let label: string;

    if (granularity === 'weekly') {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      points = 4;
      label = 'week';
    } else {
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - diff);
      monday.setHours(0, 0, 0, 0);
      currentStart = monday;
      points = 7;
      label = 'day';
    }

    const signups = await this.getTimeSeriesCount(
      'users',
      'created_at',
      currentStart,
      currentEnd,
      points,
      'deleted_at IS NULL',
    );
    const categories = this.generateLabels(
      currentStart,
      currentEnd,
      points,
      label,
    );

    return { categories, signups };
  }

  async getTopProducts() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const rows: Array<{
      id: string;
      name: string;
      categoryName: string;
      unitsSold: string;
      revenue: string;
    }> = await this.dataSource.query(
      `SELECT p.id, p.name, COALESCE(c.name, '') as "categoryName", SUM(oi.quantity)::int as "unitsSold", COALESCE(SUM(oi.total_price), 0) as revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE o.created_at >= $1
         AND o.payment_status IN ('PAID','REFUNDED','PARTIALLY_REFUNDED')
       GROUP BY p.id, p.name, c.name
       ORDER BY revenue DESC
       LIMIT 5`,
      [monthStart],
    );

    const products = rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.categoryName,
      unitsSold: parseInt(r.unitsSold ?? '0', 10),
      revenue: parseFloat(r.revenue ?? '0'),
    }));

    return { products };
  }

  async getRecentOrders() {
    const rows: Array<{
      id: string;
      orderNumber: string;
      firstName: string;
      lastName: string;
      totalAmount: string;
      paymentStatus: string;
      createdAt: Date;
    }> = await this.dataSource.query(
      `SELECT o.id, o.order_number as "orderNumber", u.first_name as "firstName", u.last_name as "lastName", o.total_amount as "totalAmount", o.payment_status as "paymentStatus", o.created_at as "createdAt"
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC
       LIMIT 5`,
    );

    const statusMap: Record<string, string> = {
      PAID: 'Paid',
      PENDING: 'Pending',
      FAILED: 'Failed',
      REFUNDED: 'Refunded',
      PARTIALLY_REFUNDED: 'Refunded',
      PROCESSING: 'Pending',
      CANCELLED: 'Failed',
    };

    const orders = rows.map((r) => ({
      id: r.orderNumber,
      customerName: `${r.firstName} ${r.lastName}`,
      amount: parseFloat(r.totalAmount ?? '0'),
      status: statusMap[r.paymentStatus] ?? 'Pending',
      createdAt: r.createdAt,
    }));

    return { orders };
  }

  private async getTimeSeries(
    table: string,
    column: string,
    dateColumn: string,
    start: Date,
    end: Date,
    points: number,
    whereClause = '',
  ): Promise<number[]> {
    const diffMs = end.getTime() - start.getTime();
    const intervalMs = points > 1 ? diffMs / points : diffMs;

    const result: number[] = [];
    for (let i = 0; i < points; i++) {
      const binStart = new Date(start.getTime() + i * intervalMs);
      const binEnd =
        i === points - 1
          ? end
          : new Date(start.getTime() + (i + 1) * intervalMs);
      const where = whereClause ? `AND ${whereClause}` : '';
      const query = `SELECT COALESCE(SUM(${column}), 0) as val FROM ${table} WHERE ${dateColumn} >= $1 AND ${dateColumn} < $2 ${where}`;
      const row = await this.dataSource.query(query, [binStart, binEnd]);
      result.push(parseFloat(row[0]?.val ?? '0'));
    }
    return result;
  }

  private async getTimeSeriesCount(
    table: string,
    dateColumn: string,
    start: Date,
    end: Date,
    points: number,
    whereClause = '',
  ): Promise<number[]> {
    const diffMs = end.getTime() - start.getTime();
    const intervalMs = points > 1 ? diffMs / points : diffMs;

    const result: number[] = [];
    for (let i = 0; i < points; i++) {
      const binStart = new Date(start.getTime() + i * intervalMs);
      const binEnd =
        i === points - 1
          ? end
          : new Date(start.getTime() + (i + 1) * intervalMs);
      const where = whereClause ? `AND ${whereClause}` : '';
      const query = `SELECT COUNT(*)::int as val FROM ${table} WHERE ${dateColumn} >= $1 AND ${dateColumn} < $2 ${where}`;
      const row = await this.dataSource.query(query, [binStart, binEnd]);
      result.push(parseInt(row[0]?.val ?? '0', 10));
    }
    return result;
  }

  private generateLabels(
    start: Date,
    end: Date,
    points: number,
    labelType: string,
  ): string[] {
    const labels: string[] = [];
    const diffMs = end.getTime() - start.getTime();
    const intervalMs = points > 1 ? diffMs / points : diffMs;

    for (let i = 0; i < points; i++) {
      const d = new Date(start.getTime() + i * intervalMs);
      let formatted: string;
      if (labelType === 'month') {
        formatted = d.toLocaleDateString('en-GB', { month: 'short' });
      } else if (labelType === 'week') {
        formatted = `${d.getDate()} ${d.toLocaleDateString('en-GB', { month: 'short' })}`;
      } else {
        formatted = `${d.getDate()} ${d.toLocaleDateString('en-GB', { month: 'short' })}`;
      }
      labels.push(formatted);
    }
    return labels;
  }
}
