import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{ items: Inventory[]; total: number }> {
    const [items, total] = await this.inventoryRepository.findAndCount({
      relations: { variant: true },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async findLowStock(
    page = 1,
    limit = 20,
  ): Promise<{ items: Inventory[]; total: number }> {
    const qb = this.inventoryRepository
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.variant', 'variant')
      .where('inv.availableQuantity > 0')
      .andWhere('inv.availableQuantity <= inv.low_stock_threshold')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('inv.availableQuantity', 'ASC');

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findOutOfStock(
    page = 1,
    limit = 20,
  ): Promise<{ items: Inventory[]; total: number }> {
    const [items, total] = await this.inventoryRepository.findAndCount({
      where: { availableQuantity: 0 },
      relations: { variant: true },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async getAlerts(
    page = 1,
    limit = 20,
  ): Promise<{ items: StockAlert[]; total: number }> {
    const [items, total] = await this.alertRepository.findAndCount({
      where: { isResolved: false },
      order: { triggeredAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async getMovements(
    page = 1,
    limit = 20,
  ): Promise<{ items: InventoryAudit[]; total: number }> {
    const [items, total] = await this.auditRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
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
}
