import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { PurchaseOrderItem } from '../entities/purchase-order-item.entity';
import { Supplier } from '../entities/supplier.entity';
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';
import { CreatePurchaseOrderDto } from '../dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from '../dto/update-purchase-order.dto';
import { PurchaseOrderQueryDto } from '../dto/purchase-order-query.dto';
import { PurchaseOrderStatus } from '../enums/purchase-order-status.enum';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private readonly poItemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
  ) {}

  private async generatePONumber(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await this.dataSource.query(
      `INSERT INTO po_sequence_counters ("year", last_number) VALUES ($1, 1)
       ON CONFLICT (year) DO UPDATE SET last_number = po_sequence_counters.last_number + 1
       RETURNING last_number`,
      [year],
    );
    const seq = result[0]?.last_number ?? 1;
    return `PO-${year}-${String(seq).padStart(6, '0')}`;
  }

  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const supplier = await this.supplierRepository.findOne({ where: { id: dto.supplierId } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const poNumber = await this.generatePONumber();
    const po = new PurchaseOrder();
    po.poNumber = poNumber;
    po.supplierId = dto.supplierId;
    po.notes = dto.notes;
    po.expectedDate = dto.expectedDate ? new Date(dto.expectedDate) : null;
    po.status = PurchaseOrderStatus.DRAFT;
    const savedPO = await this.poRepository.save(po);

    let totalAmount = 0;
    const items: PurchaseOrderItem[] = [];
    for (const itemDto of dto.items) {
      const variant = await this.variantRepository.findOne({ where: { id: itemDto.variantId } });
      if (!variant) {
        throw new NotFoundException(`Variant ${itemDto.variantId} not found`);
      }
      const lineTotal = itemDto.quantity * itemDto.costPrice;
      totalAmount += lineTotal;
      const item = new PurchaseOrderItem();
      item.purchaseOrderId = savedPO.id;
      item.variantId = itemDto.variantId;
      item.quantity = itemDto.quantity;
      item.costPrice = itemDto.costPrice;
      item.lineTotal = lineTotal;
      items.push(item);
    }
    await this.poItemRepository.save(items);

    savedPO.totalAmount = totalAmount;
    await this.poRepository.save(savedPO);

    return this.findById(savedPO.id);
  }

  async findAll(query: PurchaseOrderQueryDto): Promise<{ items: PurchaseOrder[]; total: number }> {
    const { search, status, supplierId, page = 1, limit = 20 } = query;
    const qb = this.poRepository.createQueryBuilder('po')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .leftJoinAndSelect('po.items', 'items');

    if (search) {
      qb.andWhere('po.poNumber LIKE :search', { search: `%${search}%` });
    }
    if (status) {
      qb.andWhere('po.status = :status', { status });
    }
    if (supplierId) {
      qb.andWhere('po.supplierId = :supplierId', { supplierId });
    }

    const [items, total] = await qb
      .orderBy('po.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  async findById(id: string): Promise<PurchaseOrder> {
    const po = await this.poRepository.findOne({
      where: { id },
      relations: { supplier: true, items: true },
    });
    if (!po) {
      throw new NotFoundException(`Purchase order with ID "${id}" not found`);
    }
    return po;
  }

  async update(id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const po = await this.findById(id);
    if (po.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Can only update DRAFT purchase orders');
    }

    if (dto.supplierId) {
      const supplier = await this.supplierRepository.findOne({ where: { id: dto.supplierId } });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    if (dto.items) {
      await this.poItemRepository.delete({ purchaseOrderId: id });

      let totalAmount = 0;
      const items: PurchaseOrderItem[] = [];
      for (const itemDto of dto.items) {
        const variant = await this.variantRepository.findOne({ where: { id: itemDto.variantId } });
        if (!variant) {
          throw new NotFoundException(`Variant ${itemDto.variantId} not found`);
        }
        const lineTotal = itemDto.quantity * itemDto.costPrice;
        totalAmount += lineTotal;
        const item = this.poItemRepository.create({
          purchaseOrderId: id,
          variantId: itemDto.variantId,
          quantity: itemDto.quantity,
          costPrice: itemDto.costPrice,
          lineTotal,
        });
        items.push(item);
      }
      await this.poItemRepository.save(items);
      (dto as any).totalAmount = totalAmount;
    }

    const updateData: any = { ...dto };
    if (dto.expectedDate) {
      updateData.expectedDate = new Date(dto.expectedDate);
    }
    await this.poRepository.update(id, updateData);
    return this.findById(id);
  }

  async approve(id: string): Promise<PurchaseOrder> {
    const po = await this.findById(id);
    if (po.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT purchase orders can be approved');
    }
    po.status = PurchaseOrderStatus.APPROVED;
    return this.poRepository.save(po);
  }

  async cancel(id: string): Promise<PurchaseOrder> {
    const po = await this.findById(id);
    if (po.status === PurchaseOrderStatus.CLOSED || po.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException('Purchase order is already closed or cancelled');
    }
    po.status = PurchaseOrderStatus.CANCELLED;
    return this.poRepository.save(po);
  }

  async updateStatusOnReceive(id: string): Promise<void> {
    const po = await this.findById(id);
    const allItems = po.items;
    const totalQty = allItems.reduce((sum, i) => sum + i.quantity, 0);
    const receivedQty = allItems.reduce((sum, i) => sum + i.receivedQuantity, 0);

    if (receivedQty === 0) return;

    if (receivedQty >= totalQty) {
      po.status = PurchaseOrderStatus.RECEIVED;
    } else {
      po.status = PurchaseOrderStatus.PARTIALLY_RECEIVED;
    }
    await this.poRepository.save(po);
  }
}
