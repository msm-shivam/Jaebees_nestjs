import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class InventoryReportService {
  constructor(private readonly dataSource: DataSource) {}

  async getReport(_dateFrom?: string, _dateTo?: string) {
    const qb = this.dataSource.createQueryBuilder()
      .select([
        'COALESCE(SUM(i.quantity * COALESCE(pv.cost_price, 0)), 0) as "totalStockValue"',
        'COUNT(CASE WHEN i.quantity <= i.low_stock_threshold AND i.quantity > 0 THEN 1 END)::int as "lowStockItems"',
        'COUNT(CASE WHEN i.quantity = 0 THEN 1 END)::int as "outOfStockItems"',
        'COUNT(*)::int as "totalInventoryItems"',
      ])
      .from('inventories', 'i')
      .leftJoin('product_variants', 'pv', 'pv.id = i.variant_id');

    const summary = await qb.getRawOne();

    const lowStock = await this.dataSource.createQueryBuilder()
      .select([
        'i.id as "inventoryId"',
        'pv.product_id as "productId"',
        'p.name as "productName"',
        'i.quantity as "currentStock"',
        'i.low_stock_threshold as "threshold"',
        'COALESCE(pv.cost_price, 0) as "unitCost"',
      ])
      .from('inventories', 'i')
      .leftJoin('product_variants', 'pv', 'pv.id = i.variant_id')
      .leftJoin('products', 'p', 'p.id = pv.product_id')
      .where('i.quantity <= i.low_stock_threshold')
      .orderBy('i.quantity', 'ASC')
      .limit(50)
      .getRawMany();

    return {
      data: {
        totalStockValue: parseFloat(summary?.totalStockValue ?? '0'),
        lowStockItems: parseInt(summary?.lowStockItems ?? '0', 10),
        outOfStockItems: parseInt(summary?.outOfStockItems ?? '0', 10),
        totalInventoryItems: parseInt(summary?.totalInventoryItems ?? '0', 10),
        lowStock,
      },
    };
  }
}
