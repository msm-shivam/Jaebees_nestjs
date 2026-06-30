import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ProductReportService {
  constructor(private readonly dataSource: DataSource) {}

  async getReport(dateFrom?: string, dateTo?: string) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'p.id as "productId"',
        'p.name as "productName"',
        'COALESCE(SUM(oi.quantity), 0) as "totalSold"',
        'COALESCE(SUM(oi.total_price), 0) as "totalRevenue"',
        'COUNT(DISTINCT o.id) as "orderCount"',
        '(SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.deleted_at IS NULL ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) as "imageUrl"',
      ])
      .from('products', 'p')
      .leftJoin('order_items', 'oi', 'oi.product_id = p.id')
      .leftJoin(
        'orders',
        'o',
        'o.id = oi.order_id AND o.status NOT IN (:...excluded)',
        { excluded: ['CANCELLED'] },
      );

    if (dateFrom) qb.andWhere('o.created_at >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('o.created_at <= :dateTo', { dateTo });

    qb.groupBy('p.id, p.name');
    qb.orderBy('"totalSold"', 'DESC');

    const rows = await qb.getRawMany();
    const mappedRows = rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      imageUrl: r.imageUrl || null,
      totalSold: parseInt(r.totalSold, 10),
      totalRevenue: parseFloat(r.totalRevenue),
      orderCount: parseInt(r.orderCount, 10),
    }));

    // Summary
    const summaryQb = this.dataSource
      .createQueryBuilder()
      .select([
        'COUNT(DISTINCT p.id) as "totalProduct"',
        'COALESCE(SUM(oi.quantity), 0) as "productSold"',
      ])
      .from('products', 'p')
      .leftJoin('order_items', 'oi', 'oi.product_id = p.id')
      .leftJoin(
        'orders',
        'o',
        'o.id = oi.order_id AND o.status NOT IN (:...excluded)',
        { excluded: ['CANCELLED'] },
      );

    if (dateFrom) summaryQb.andWhere('o.created_at >= :dateFrom', { dateFrom });
    if (dateTo) summaryQb.andWhere('o.created_at <= :dateTo', { dateTo });

    const summary = await summaryQb.getRawOne();

    const topEarner = mappedRows.length > 0
      ? {
          productId: mappedRows[0].productId,
          productName: mappedRows[0].productName,
          totalRevenue: mappedRows[0].totalRevenue,
          totalSold: mappedRows[0].totalSold,
          imageUrl: mappedRows[0].imageUrl,
        }
      : null;

    return {
      products: mappedRows,
      totalProduct: parseInt(summary?.totalProduct ?? '0', 10),
      productSold: parseFloat(summary?.productSold ?? '0'),
      topEarner,
    };
  }

  async getByCategory(dateFrom?: string, dateTo?: string) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'c.id as "categoryId"',
        'c.name as "categoryName"',
        'COALESCE(SUM(oi.quantity), 0) as "totalSold"',
        'COALESCE(SUM(oi.total_price), 0) as "totalRevenue"',
        'COUNT(DISTINCT o.id) as "orderCount"',
      ])
      .from('categories', 'c')
      .leftJoin('products', 'p', 'p.category_id = c.id')
      .leftJoin('order_items', 'oi', 'oi.product_id = p.id')
      .leftJoin(
        'orders',
        'o',
        'o.id = oi.order_id AND o.status NOT IN (:...excluded)',
        { excluded: ['CANCELLED'] },
      );

    if (dateFrom) qb.andWhere('o.created_at >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('o.created_at <= :dateTo', { dateTo });

    qb.groupBy('c.id, c.name');
    qb.orderBy('"totalRevenue"', 'DESC');

    const rows = await qb.getRawMany();
    const mappedRows = rows.map((r) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      totalSold: parseInt(r.totalSold, 10),
      totalRevenue: parseFloat(r.totalRevenue),
      orderCount: parseInt(r.orderCount, 10),
    }));
    return { data: mappedRows };
  }

  async getByBrand(dateFrom?: string, dateTo?: string) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'b.id as "brandId"',
        'b.name as "brandName"',
        'COALESCE(SUM(oi.quantity), 0) as "totalSold"',
        'COALESCE(SUM(oi.total_price), 0) as "totalRevenue"',
        'COUNT(DISTINCT o.id) as "orderCount"',
      ])
      .from('brands', 'b')
      .leftJoin('products', 'p', 'p.brand_id = b.id')
      .leftJoin('order_items', 'oi', 'oi.product_id = p.id')
      .leftJoin(
        'orders',
        'o',
        'o.id = oi.order_id AND o.status NOT IN (:...excluded)',
        { excluded: ['CANCELLED'] },
      );

    if (dateFrom) qb.andWhere('o.created_at >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('o.created_at <= :dateTo', { dateTo });

    qb.groupBy('b.id, b.name');
    qb.orderBy('"totalRevenue"', 'DESC');

    const rows = await qb.getRawMany();
    const mappedRows = rows.map((r) => ({
      brandId: r.brandId,
      brandName: r.brandName,
      totalSold: parseInt(r.totalSold, 10),
      totalRevenue: parseFloat(r.totalRevenue),
      orderCount: parseInt(r.orderCount, 10),
    }));
    return { data: mappedRows };
  }
}
