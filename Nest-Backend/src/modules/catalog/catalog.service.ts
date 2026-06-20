import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditLogService } from '../security-compliance/services/audit-log.service';
import { CatalogOverviewDto } from './dto/catalog-overview.dto';
import {
  CatalogSummaryDto,
  CatalogSummaryItem,
} from './dto/catalog-summary.dto';
import { CatalogQuickLinkDto } from './dto/catalog-quick-link.dto';
import { CatalogAnalyticsDto } from './dto/catalog-analytics.dto';

@Injectable()
export class CatalogService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getOverview(): Promise<{ data: CatalogOverviewDto }> {
    const [productCount, categoryCount, brandCount, reviewCount, variantCount] =
      await Promise.all([
        this.countWhere('products', 'is_active = true'),
        this.count('categories'),
        this.count('brands'),
        this.count('reviews'),
        this.count('product_variants'),
      ]);

    return {
      data: {
        totalProducts: productCount,
        totalCategories: categoryCount,
        totalBrands: brandCount,
        totalReviews: reviewCount,
        totalVariants: variantCount,
      },
    };
  }

  async getSummary(): Promise<{ data: CatalogSummaryDto }> {
    const [active, draft, archived, outOfStock, lowStock] = await Promise.all([
      this.countWhere('products', "status = 'ACTIVE'"),
      this.countWhere('products', "status = 'DRAFT'"),
      this.countWhere('products', "status = 'ARCHIVED'"),
      this.rawValue(
        `SELECT COUNT(*)::int AS c FROM "inventories" WHERE available_quantity <= 0`,
      ),
      this.rawValue(
        `SELECT COUNT(*)::int AS c FROM "inventories" WHERE quantity <= low_stock_threshold AND quantity > 0`,
      ),
    ]);

    const items: CatalogSummaryItem[] = [
      { label: 'Active Products', value: active, color: 'green' },
      { label: 'Draft Products', value: draft, color: 'yellow' },
      { label: 'Archived Products', value: archived, color: 'gray' },
      { label: 'Out of Stock', value: outOfStock, color: 'red' },
      { label: 'Low Stock', value: lowStock, color: 'orange' },
    ];

    return { data: { items } };
  }

  async getQuickLinks(): Promise<{ data: CatalogQuickLinkDto[] }> {
    const links: CatalogQuickLinkDto[] = [
      {
        label: 'Products',
        href: '/catalog/products',
        description: 'Manage your product catalog',
      },
      {
        label: 'Categories',
        href: '/catalog/categories',
        description: 'Organize products by categories',
      },
      {
        label: 'Brands',
        href: '/catalog/brands',
        description: 'Manage brand portfolio',
      },
      {
        label: 'Reviews',
        href: '/catalog/reviews',
        description: 'Moderate customer reviews',
      },
    ];

    return { data: links };
  }

  async getAnalytics(adminId: string): Promise<{ data: CatalogAnalyticsDto }> {
    const [
      avgRating,
      reviewCount,
      lowStockCount,
      outOfStockCount,
      topCategory,
      topBrand,
    ] = await Promise.all([
      this.rawValue(
        `SELECT COALESCE(AVG(rating),0)::numeric(10,2) AS c FROM "reviews"`,
      ),
      this.count('reviews'),
      this.rawValue(
        `SELECT COUNT(*)::int AS c FROM "inventories" WHERE quantity <= low_stock_threshold AND quantity > 0`,
      ),
      this.rawValue(
        `SELECT COUNT(*)::int AS c FROM "inventories" WHERE available_quantity <= 0`,
      ),
      this.rawValue(
        `SELECT c.name AS c FROM "categories" c JOIN "products" p ON p.category_id = c.id GROUP BY c.id, c.name ORDER BY COUNT(p.id) DESC LIMIT 1`,
      ),
      this.rawValue(
        `SELECT b.name AS c FROM "brands" b JOIN "products" p ON p.brand_id = b.id GROUP BY b.id, b.name ORDER BY COUNT(p.id) DESC LIMIT 1`,
      ),
    ]);

  

    return {
      data: {
        averageRating: parseFloat(avgRating),
        reviewCount,
        lowStockCount,
        outOfStockCount,
        topCategory,
        topBrand,
      },
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async count(table: string): Promise<number> {
    const result = await this.dataSource.query(
      `SELECT COUNT(*)::int AS c FROM "${table}"`,
    );
    return parseInt(result[0]?.c ?? '0', 10);
  }

  private async countWhere(table: string, where: string): Promise<number> {
    const result = await this.dataSource.query(
      `SELECT COUNT(*)::int AS c FROM "${table}" WHERE ${where}`,
    );
    return parseInt(result[0]?.c ?? '0', 10);
  }

  private async rawValue(sql: string): Promise<any> {
    const result = await this.dataSource.query(sql);
    return result[0]?.c ?? null;
  }
}
