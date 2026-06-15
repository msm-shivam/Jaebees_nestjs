import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { StockAlert } from '../entities/stock-alert.entity';
import { InventoryAudit } from '../entities/inventory-audit.entity';
import { Supplier } from '../entities/supplier.entity';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { PurchaseOrderStatus } from '../enums/purchase-order-status.enum';
import { AuditActionType } from '../enums/audit-action-type.enum';

@Injectable()
export class InventoryAnalyticsService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(StockAlert)
    private readonly alertRepository: Repository<StockAlert>,
    @InjectRepository(InventoryAudit)
    private readonly auditRepository: Repository<InventoryAudit>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
  ) {}

  async getSummary(): Promise<any> {
    const inventories = await this.inventoryRepository.find({
      relations: { variant: true },
    });

    let totalStockValue = 0;
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const inv of inventories) {
      totalStockUnits += inv.quantity;
      totalStockValue += (inv.variant?.costPrice || 0) * inv.quantity;
      if (
        inv.availableQuantity <= inv.lowStockThreshold &&
        inv.availableQuantity > 0
      ) {
        lowStockCount++;
      }
      if (inv.availableQuantity <= 0) {
        outOfStockCount++;
      }
    }

    const activeSuppliers = await this.supplierRepository.count({
      where: { isActive: true },
    });
    const openPOs = await this.poRepository.count({
      where: [
        { status: PurchaseOrderStatus.DRAFT },
        { status: PurchaseOrderStatus.APPROVED },
        { status: PurchaseOrderStatus.PARTIALLY_RECEIVED },
      ],
    });

    return {
      totalStockValue: Math.round(totalStockValue * 100) / 100,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      activeSuppliers,
      openPurchaseOrders: openPOs,
    };
  }

  async getTopSelling(limit = 10): Promise<any[]> {
    const result = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.variantId', 'variantId')
      .addSelect('COUNT(*)', 'transactions')
      .where('audit.actionType = :actionType', {
        actionType: AuditActionType.STOCK_OUT,
      })
      .groupBy('audit.variantId')
      .orderBy('"transactions"', 'DESC')
      .limit(limit)
      .getRawMany();

    return result;
  }

  async getSlowMoving(): Promise<any[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inventories = await this.inventoryRepository.find({
      relations: { variant: true },
      where: {},
    });

    const result: any[] = [];
    for (const inv of inventories) {
      const recentMovement = await this.auditRepository.findOne({
        where: {
          variantId: inv.variantId,
          actionType: AuditActionType.STOCK_OUT,
        },
        order: { createdAt: 'DESC' },
      });

      if (!recentMovement || recentMovement.createdAt < thirtyDaysAgo) {
        result.push({
          variantId: inv.variantId,
          currentStock: inv.quantity,
          lastMovementDate: recentMovement?.createdAt || null,
          daysWithoutSale: recentMovement
            ? Math.floor(
                (Date.now() - recentMovement.createdAt.getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : 999,
        });
      }
    }

    return result.slice(0, 20);
  }

  async getStockValue(): Promise<any> {
    const inventories = await this.inventoryRepository.find({
      relations: { variant: true },
    });

    let totalValue = 0;
    for (const inv of inventories) {
      totalValue += (inv.variant?.costPrice || 0) * inv.quantity;
    }

    return {
      totalStockValue: Math.round(totalValue * 100) / 100,
      totalItems: inventories.length,
    };
  }

  async getAlertStats(): Promise<any> {
    const totalAlerts = await this.alertRepository.count();
    const unresolvedAlerts = await this.alertRepository.count({
      where: { isResolved: false },
    });
    const lowStockAlerts = await this.alertRepository.count({
      where: { alertType: 'LOW_STOCK', isResolved: false },
    });
    const outOfStockAlerts = await this.alertRepository.count({
      where: { alertType: 'OUT_OF_STOCK', isResolved: false },
    });

    return {
      totalAlerts,
      unresolvedAlerts,
      lowStockAlerts,
      outOfStockAlerts,
    };
  }
}
