import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';
import { StockAdjustment } from '../entities/stock-adjustment.entity';
import { StockAlert } from '../entities/stock-alert.entity';
import { InventoryAudit } from '../entities/inventory-audit.entity';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { AuditActionType } from '../enums/audit-action-type.enum';

@Injectable()
export class InventoryPlusService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(StockAdjustment)
    private readonly adjustmentRepository: Repository<StockAdjustment>,
    @InjectRepository(StockAlert)
    private readonly alertRepository: Repository<StockAlert>,
    @InjectRepository(InventoryAudit)
    private readonly auditRepository: Repository<InventoryAudit>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [items, total] = await this.inventoryRepository.findAndCount({
      relations: { variant: true },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      items: items.map((i) => this.inventoryToPlain(i)),
      total,
    };
  }

  async findLowStock(page = 1, limit = 20) {
    const qb = this.inventoryRepository
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.variant', 'variant')
      .where('inv.availableQuantity > 0')
      .andWhere('inv.availableQuantity <= inv.low_stock_threshold')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('inv.availableQuantity', 'ASC');

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((i) => this.inventoryToPlain(i)),
      total,
    };
  }

  async findOutOfStock(page = 1, limit = 20) {
    const [items, total] = await this.inventoryRepository.findAndCount({
      where: { availableQuantity: 0 },
      relations: { variant: true },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      items: items.map((i) => this.inventoryToPlain(i)),
      total,
    };
  }

  async getAlerts(page = 1, limit = 20, search?: string, status?: string) {
    const qb = this.alertRepository
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.variant', 'variant')
      .orderBy('alert.triggeredAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('variant.sku ILIKE :search', { search: `%${search}%` });
    }

    if (status === 'resolved') {
      qb.andWhere('alert.isResolved = :resolved', { resolved: true });
    } else if (status === 'unresolved') {
      qb.andWhere('alert.isResolved = :resolved', { resolved: false });
    } else {
      qb.andWhere('alert.isResolved = :resolved', { resolved: false });
    }

    const [items, total] = await qb.getManyAndCount();

    // Fetch variant SKUs for alerts
    const variantIds = [...new Set(items.map((a) => a.variantId))];
    const variants = variantIds.length
      ? await this.variantRepository.find({
          where: { id: In(variantIds) },
          relations: { product: true },
        })
      : [];
    const variantMap = new Map(variants.map((v) => [v.id, v.sku]));

    return {
      items: items.map((a) => ({
        id: a.id,
        variantId: a.variantId,
        variantSku: variantMap.get(a.variantId) ?? '',
        thresholdQuantity: a.thresholdQuantity,
        currentQuantity: a.currentQuantity,
        alertType: a.alertType,
        isResolved: a.isResolved,
        triggeredAt: a.triggeredAt,
        resolvedAt: a.resolvedAt,
        createdAt: a.createdAt,
      })),
      total,
    };
  }

  async getMovements(page = 1, limit = 20, actionType?: string) {
    const validTypes = Object.values(AuditActionType);
    if (actionType && !validTypes.includes(actionType as AuditActionType)) {
      throw new BadRequestException(
        `Invalid actionType. Valid values: ${validTypes.join(', ')}`,
      );
    }
    const where: Record<string, unknown> = {};
    if (actionType) {
      where.actionType = actionType;
    }
    const [items, total] = await this.auditRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Fetch variant SKUs for movements
    const variantIds = [...new Set(items.map((m) => m.variantId))];
    const variants = variantIds.length
      ? await this.variantRepository.find({
          where: { id: In(variantIds) },
          relations: { product: true },
        })
      : [];
    const variantMap = new Map(variants.map((v) => [v.id, v.sku]));

    return {
      items: items.map((m) => ({
        id: m.id,
        variantId: m.variantId,
        variantSku: variantMap.get(m.variantId) ?? '',
        actionType: m.actionType,
        direction: m.afterQuantity > m.beforeQuantity ? 'UP' : m.afterQuantity < m.beforeQuantity ? 'DOWN' : 'SAME',
        change: m.afterQuantity - m.beforeQuantity,
        beforeQuantity: m.beforeQuantity,
        afterQuantity: m.afterQuantity,
        referenceType: m.referenceType,
        referenceId: m.referenceId,
        notes: m.notes,
        performedBy: m.performedBy,
        createdAt: m.createdAt,
      })),
      total,
    };
  }

  async adjustStock(dto: AdjustStockDto): Promise<Inventory> {
    const variant = await this.variantRepository.findOne({
      where: { id: dto.variantId },
    });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    let inventory = await this.inventoryRepository.findOne({
      where: { variantId: dto.variantId },
    });
    if (!inventory) {
      inventory = this.inventoryRepository.create({
        variantId: dto.variantId,
        quantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
      });
      inventory = await this.inventoryRepository.save(inventory);
    }

    const beforeQty = inventory.quantity;
    const newQuantity = inventory.quantity + dto.quantity;

    if (newQuantity < 0) {
      throw new BadRequestException('Cannot reduce quantity below zero');
    }

    inventory.quantity = newQuantity;
    inventory.availableQuantity =
      inventory.quantity - inventory.reservedQuantity;
    await this.inventoryRepository.save(inventory);

    // Auto-create alert if stock falls to or below threshold
    const threshold =
      inventory.reorderPoint > 0
        ? inventory.reorderPoint
        : inventory.lowStockThreshold;
    if (inventory.availableQuantity <= threshold) {
      const alertType =
        inventory.availableQuantity <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK';
      const existing = await this.alertRepository.findOne({
        where: { variantId: inventory.variantId, isResolved: false, alertType },
      });
      if (!existing) {
        await this.alertRepository.save(
          this.alertRepository.create({
            variantId: inventory.variantId,
            thresholdQuantity: threshold,
            currentQuantity: inventory.availableQuantity,
            alertType,
          }),
        );
      }
    }

    await this.adjustmentRepository.save(
      this.adjustmentRepository.create({
        variantId: dto.variantId,
        previousQuantity: beforeQty,
        newQuantity,
        reason: dto.reason,
      }),
    );

    await this.auditRepository.save(
      this.auditRepository.create({
        variantId: dto.variantId,
        actionType: AuditActionType.MANUAL_ADJUST,
        beforeQuantity: beforeQty,
        afterQuantity: newQuantity,
        notes: dto.reason,
      }),
    );

    return inventory;
  }

  async checkAndCreateAlerts(): Promise<number> {
    const inventories = await this.inventoryRepository.find({
      relations: { variant: true },
    });
    let alertCount = 0;

    for (const inv of inventories) {
      const threshold =
        inv.reorderPoint > 0 ? inv.reorderPoint : inv.lowStockThreshold;

      if (inv.availableQuantity <= threshold && inv.availableQuantity > 0) {
        const existingAlert = await this.alertRepository.findOne({
          where: { variantId: inv.variantId, isResolved: false },
        });
        if (!existingAlert) {
          await this.alertRepository.save(
            this.alertRepository.create({
              variantId: inv.variantId,
              thresholdQuantity: threshold,
              currentQuantity: inv.availableQuantity,
              alertType: 'LOW_STOCK',
            }),
          );
          alertCount++;
        }
      }

      if (inv.availableQuantity <= 0) {
        const existingAlert = await this.alertRepository.findOne({
          where: {
            variantId: inv.variantId,
            isResolved: false,
            alertType: 'OUT_OF_STOCK',
          },
        });
        if (!existingAlert) {
          await this.alertRepository.save(
            this.alertRepository.create({
              variantId: inv.variantId,
              thresholdQuantity: inv.lowStockThreshold,
              currentQuantity: inv.availableQuantity,
              alertType: 'OUT_OF_STOCK',
            }),
          );
          alertCount++;
        }
      }
    }

    return alertCount;
  }

  async resolveAlerts(): Promise<number> {
    const alerts = await this.alertRepository.find({
      where: { isResolved: false },
    });
    let resolvedCount = 0;

    for (const alert of alerts) {
      const inv = await this.inventoryRepository.findOne({
        where: { variantId: alert.variantId },
      });
      if (inv) {
        const threshold =
          inv.reorderPoint > 0 ? inv.reorderPoint : inv.lowStockThreshold;
        if (inv.availableQuantity > threshold) {
          alert.isResolved = true;
          alert.resolvedAt = new Date();
          await this.alertRepository.save(alert);
          resolvedCount++;
        }
      }
    }

    return resolvedCount;
  }

  async resolveAlert(id: string): Promise<{ message: string }> {
    const alert = await this.alertRepository.findOne({ where: { id } });
    if (!alert) throw new NotFoundException('Alert not found');
    alert.isResolved = true;
    alert.resolvedAt = new Date();
    await this.alertRepository.save(alert);
    return { message: 'Alert resolved successfully' };
  }

  private inventoryToPlain(inv: Inventory) {
    return {
      id: inv.id,
      variantId: inv.variantId,
      variantSku: inv.variant?.sku ?? '',
      quantity: inv.quantity,
      reservedQuantity: inv.reservedQuantity,
      availableQuantity: inv.availableQuantity,
      lowStockThreshold: inv.lowStockThreshold,
      reorderPoint: inv.reorderPoint,
      reorderQuantity: inv.reorderQuantity,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    };
  }
}
