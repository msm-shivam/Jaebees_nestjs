import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { GoodsReceipt } from '../entities/goods-receipt.entity';
import { GoodsReceiptItem } from '../entities/goods-receipt-item.entity';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { PurchaseOrderItem } from '../entities/purchase-order-item.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { InventoryAudit } from '../entities/inventory-audit.entity';
import { CreateGoodsReceiptDto } from '../dto/create-goods-receipt.dto';
import { PurchaseOrderStatus } from '../enums/purchase-order-status.enum';
import { AuditActionType } from '../enums/audit-action-type.enum';
import { PurchaseOrderService } from './purchase-order.service';

@Injectable()
export class GoodsReceiptService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(GoodsReceipt)
    private readonly receiptRepository: Repository<GoodsReceipt>,
    @InjectRepository(GoodsReceiptItem)
    private readonly receiptItemRepository: Repository<GoodsReceiptItem>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private readonly poItemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryAudit)
    private readonly auditRepository: Repository<InventoryAudit>,
    private readonly purchaseOrderService: PurchaseOrderService,
  ) {}

  private async generateReceiptNumber(): Promise<string> {
    const result = await this.dataSource.query(
      `INSERT INTO grn_sequence_counters (last_number) VALUES (1)
       ON CONFLICT (locked) DO UPDATE SET last_number = grn_sequence_counters.last_number + 1
       RETURNING last_number`,
    );
    const seq = result[0]?.last_number ?? 1;
    return `GRN-${String(seq).padStart(6, '0')}`;
  }

  async create(dto: CreateGoodsReceiptDto): Promise<GoodsReceipt> {
    const po = await this.poRepository.findOne({
      where: { id: dto.purchaseOrderId },
      relations: { items: true },
    });
    if (!po) {
      throw new NotFoundException('Purchase order not found');
    }
    if (po.status !== PurchaseOrderStatus.APPROVED && po.status !== PurchaseOrderStatus.PARTIALLY_RECEIVED) {
      throw new BadRequestException('Purchase order must be APPROVED to receive goods');
    }

    const receiptNumber = await this.generateReceiptNumber();
    const receipt = this.receiptRepository.create({
      receiptNumber,
      purchaseOrderId: dto.purchaseOrderId,
      receivedBy: dto.receivedBy,
      notes: dto.notes,
    });
    const savedReceipt = await this.receiptRepository.save(receipt);

    for (const itemDto of dto.items) {
      const poItem = po.items.find((i) => i.variantId === itemDto.variantId);
      if (!poItem) {
        throw new NotFoundException(`Variant ${itemDto.variantId} not found in purchase order`);
      }

      const newReceived = poItem.receivedQuantity + itemDto.quantityReceived;
      if (newReceived > poItem.quantity) {
        throw new BadRequestException(
          `Cannot receive more than ordered quantity for variant ${itemDto.variantId}. Ordered: ${poItem.quantity}, Already received: ${poItem.receivedQuantity}`,
        );
      }

      const receiptItem = this.receiptItemRepository.create({
        receiptId: savedReceipt.id,
        variantId: itemDto.variantId,
        quantityReceived: itemDto.quantityReceived,
      });
      await this.receiptItemRepository.save(receiptItem);

      poItem.receivedQuantity = newReceived;
      await this.poItemRepository.save(poItem);

      let inventory = await this.inventoryRepository.findOne({ where: { variantId: itemDto.variantId } });
      if (inventory) {
        const beforeQty = inventory.quantity;
        inventory.quantity += itemDto.quantityReceived;
        inventory.availableQuantity = inventory.quantity - inventory.reservedQuantity;
        await this.inventoryRepository.save(inventory);

        await this.auditRepository.save(this.auditRepository.create({
          variantId: itemDto.variantId,
          actionType: AuditActionType.GOODS_RECEIPT,
          beforeQuantity: beforeQty,
          afterQuantity: inventory.quantity,
          referenceType: 'goods_receipt',
          referenceId: savedReceipt.id,
        }));
      }
    }

    await this.purchaseOrderService.updateStatusOnReceive(po.id);
    return this.findById(savedReceipt.id);
  }

  async findAll(page = 1, limit = 20): Promise<{ items: GoodsReceipt[]; total: number }> {
    const [items, total] = await this.receiptRepository.findAndCount({
      relations: { purchaseOrder: true, items: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async findById(id: string): Promise<GoodsReceipt> {
    const receipt = await this.receiptRepository.findOne({
      where: { id },
      relations: { purchaseOrder: true, items: true },
    });
    if (!receipt) {
      throw new NotFoundException(`Goods receipt with ID "${id}" not found`);
    }
    return receipt;
  }
}
