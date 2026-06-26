import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { InventoryAudit } from '../inventory-plus/entities/inventory-audit.entity';
import { AuditActionType } from '../inventory-plus/enums/audit-action-type.enum';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { ReserveInventoryDto } from './dto/reserve-inventory.dto';
import { ReleaseInventoryDto } from './dto/release-inventory.dto';
import { InventoryResponseDto } from './dto/inventory-response.dto';
import {
  InventoryQueryDto,
  InventoryFilterStatus,
} from './dto/inventory-query.dto';
import { plainToInstance } from 'class-transformer';
import { ProductVariantResponseDto } from '../product-variants/dto/product-variant-response.dto';
import { AuditLogService } from '../security-compliance/services/audit-log.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(InventoryAudit)
    private readonly auditRepo: Repository<InventoryAudit>,
    private readonly auditLogService :AuditLogService
  ) {}

  async create(dto: CreateInventoryDto,adminId:string) {
    let variantId = dto.variantId;

    // Resolve variant: by SKU if no variantId provided
    if (!variantId && dto.variantSku) {
      const variantBySku = await this.variantRepo.findOne({
        where: { sku: dto.variantSku },
      });
      if (!variantBySku) {
        throw new NotFoundException(
          `Variant with SKU "${dto.variantSku}" not found`,
        );
      }
      variantId = variantBySku.id;
    }

    if (!variantId) {
      throw new BadRequestException(
        'Either variantId or variantSku is required',
      );
    }

    // Validate variant exists
    let variant = await this.variantRepo.findOne({
      where: { id: variantId },
    });

    // Fallback: if variantId not found but SKU provided, try by SKU
    if (!variant && dto.variantSku) {
      const variantBySku = await this.variantRepo.findOne({
        where: { sku: dto.variantSku },
      });
      if (variantBySku) {
        variant = variantBySku;
        variantId = variantBySku.id;
      }
    }

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Check if inventory already exists for this variant
    const existingInventory = await this.inventoryRepo.findOne({
      where: { variantId },
    });

    if (existingInventory) {
      throw new BadRequestException(
        'Inventory already exists for this variant',
      );
    }

    // Create inventory
    const inventory = this.inventoryRepo.create({
      variantId,
      quantity: dto.quantity,
      reservedQuantity: dto.reservedQuantity || 0,
      availableQuantity: dto.quantity - (dto.reservedQuantity || 0),
      lowStockThreshold: dto.lowStockThreshold ?? 5,
      reorderPoint: dto.reorderPoint ?? 10,
      reorderQuantity: dto.reorderQuantity ?? 50,
    });

    const savedInventory = await this.inventoryRepo.save(inventory);
    // await this.auditLogService.log({
    //   userId: adminId,
    //   action: 'create',
    //   entityType: 'Inventory',
    //   newValues: {  variantId,
    //   quantity: dto.quantity,
    //   reservedQuantity: dto.reservedQuantity || 0,
    //   availableQuantity: dto.quantity - (dto.reservedQuantity || 0),
    //   lowStockThreshold: dto.lowStockThreshold ?? 5,
    //   reorderPoint: dto.reorderPoint ?? 10,
    //   reorderQuantity: dto.reorderQuantity ?? 50, },
    // });
    return this.toResponse(savedInventory);
  }

  async findAll(query: InventoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.inventoryRepo
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.variant', 'variant');

    // Search by variant SKU
    if (query.search) {
      qb.andWhere('variant.sku ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    // Filter by stock status
    if (query.status && query.status !== InventoryFilterStatus.ALL) {
      if (query.status === InventoryFilterStatus.LOW_STOCK) {
        qb.andWhere(
          'inv.availableQuantity > 0 AND inv.availableQuantity <= inv.low_stock_threshold',
        );
      } else if (query.status === InventoryFilterStatus.OUT_OF_STOCK) {
        qb.andWhere('inv.availableQuantity = 0');
      } else if (query.status === InventoryFilterStatus.IN_STOCK) {
        qb.andWhere('inv.availableQuantity > 0');
      }
    }

    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('inv.createdAt', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((inv) => this.toResponse(inv)),
      total,
    };
  }

  async findVariants(search?: string) {
    const where = search
      ? [{ sku: ILike(`%${search}%`) }, { barcode: ILike(`%${search}%`) }]
      : undefined;
    const variants = await this.variantRepo.find({
      where,
      relations: { product: true },
      take: 20,
      order: { sku: 'ASC' },
    });
    return variants.map((v) =>
      plainToInstance(
        ProductVariantResponseDto,
        { ...v, productName: v.product?.name ?? '' },
        { excludeExtraneousValues: true },
      ),
    );
  }

  async findOne(id: string) {
    const inventory = await this.inventoryRepo.findOne({
      where: { id },
      relations: { variant: { product: { images: true } } },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    const variant = inventory.variant;
    const product = variant?.product;

    return {
      ...this.toResponse(inventory),
      variant: variant
        ? {
            id: variant.id,
            productId: variant.productId,
            sku: variant.sku,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            costPrice: variant.costPrice,
            barcode: variant.barcode,
            weight: variant.weight,
            status: variant.status,
            isDefault: variant.isDefault,
            createdAt: variant.createdAt,
            updatedAt: variant.updatedAt,
            product: product
              ? {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  skuPrefix: product.skuPrefix,
                  shortDescription: product.shortDescription,
                  description: product.description,
                  status: product.status,
                  isFeatured: product.isFeatured,
                  isActive: product.isActive,
                  brandId: product.brandId,
                  categoryId: product.categoryId,
                  subCategoryId: product.subCategoryId,
                  metaTitle: product.metaTitle,
                  metaDescription: product.metaDescription,
                  metaKeywords: product.metaKeywords,
                  averageRating: product.averageRating,
                  totalRatings: product.totalRatings,
                  totalReviews: product.totalReviews,
                  createdAt: product.createdAt,
                  updatedAt: product.updatedAt,
                  images: (product.images ?? []).map((img) => ({
                    id: img.id,
                    imageUrl: img.imageUrl,
                    altText: img.altText,
                    sortOrder: img.sortOrder,
                    isPrimary: img.isPrimary,
                  })),
                }
              : null,
          }
        : null,
    };
  }

  async findByVariant(variantId: string) {
    const inventory = await this.inventoryRepo.findOne({
      where: { variantId },
      relations: { variant: true },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found for this variant');
    }

    return this.toResponse(inventory);
  }

  async remove(id: string): Promise<{ message: string }> {
    const inventory = await this.inventoryRepo.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }
    await this.inventoryRepo.remove(inventory);
    return { message: 'Inventory deleted successfully' };
  }

  async update(id: string, dto: UpdateInventoryDto) {
    const inventory = await this.inventoryRepo.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    // Validate reserved quantity doesn't exceed quantity
    if (dto.quantity !== undefined && dto.reservedQuantity !== undefined) {
      if (dto.reservedQuantity > dto.quantity) {
        throw new BadRequestException(
          'Reserved quantity cannot exceed total quantity',
        );
      }
    } else if (
      dto.reservedQuantity !== undefined &&
      dto.reservedQuantity > inventory.quantity
    ) {
      throw new BadRequestException(
        'Reserved quantity cannot exceed total quantity',
      );
    }

    Object.assign(inventory, dto);

    // Recalculate available quantity
    inventory.availableQuantity =
      inventory.quantity - inventory.reservedQuantity;

    const updatedInventory = await this.inventoryRepo.save(inventory);
    return this.toResponse(updatedInventory);
  }

  async adjust(id: string, dto: AdjustInventoryDto, adminId?: string) {
    const inventory = await this.inventoryRepo.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    const beforeQty = inventory.quantity;
    const newQuantity = inventory.quantity + dto.quantity;

    if (newQuantity < 0) {
      throw new BadRequestException('Cannot reduce quantity below zero');
    }

    const newAvailable = newQuantity - inventory.reservedQuantity;
    if (newAvailable < 0) {
      throw new BadRequestException(
        `Cannot reduce quantity below reserved quantity (${inventory.reservedQuantity}). Release reserved stock first.`,
      );
    }

    inventory.quantity = newQuantity;
    inventory.availableQuantity = newAvailable;

    const updatedInventory = await this.inventoryRepo.save(inventory);

    await this.auditRepo.save(
      this.auditRepo.create({
        variantId: inventory.variantId,
        actionType: dto.quantity >= 0 ? AuditActionType.STOCK_IN : AuditActionType.STOCK_OUT,
        beforeQuantity: beforeQty,
        afterQuantity: newQuantity,
        referenceType: 'manual_adjustment',
        performedBy: adminId ?? undefined,
        notes: dto.quantity >= 0 ? `Added ${dto.quantity} units` : `Removed ${Math.abs(dto.quantity)} units`,
      }),
    );

    await this.auditLogService.log({
      userId: adminId,
      action: dto.quantity >= 0 ? 'STOCK_ADJUST_ADD' : 'STOCK_ADJUST_REMOVE',
      entityType: 'inventory',
      entityId: id,
      newValues: { quantity: newQuantity, availableQuantity: newAvailable },
      oldValues: { quantity: beforeQty },
    });

    return this.toResponse(updatedInventory);
  }

  async reserve(id: string, dto: ReserveInventoryDto, adminId?: string) {
    const inventory = await this.inventoryRepo.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    const beforeReserved = inventory.reservedQuantity;
    const newReservedQuantity = inventory.reservedQuantity + dto.quantity;

    if (newReservedQuantity > inventory.quantity) {
      throw new BadRequestException('Insufficient stock available');
    }

    inventory.reservedQuantity = newReservedQuantity;
    inventory.availableQuantity =
      inventory.quantity - inventory.reservedQuantity;

    const updatedInventory = await this.inventoryRepo.save(inventory);

    await this.auditRepo.save(
      this.auditRepo.create({
        variantId: inventory.variantId,
        actionType: AuditActionType.RESERVATION,
        beforeQuantity: beforeReserved,
        afterQuantity: newReservedQuantity,
        referenceType: 'order_reservation',
        performedBy: adminId ?? undefined,
        notes: `Reserved ${dto.quantity} units`,
      }),
    );

    await this.auditLogService.log({
      userId: adminId,
      action: 'STOCK_RESERVE',
      entityType: 'inventory',
      entityId: id,
      newValues: { reservedQuantity: newReservedQuantity, availableQuantity: inventory.quantity - newReservedQuantity },
      oldValues: { reservedQuantity: beforeReserved },
    });

    return this.toResponse(updatedInventory);
  }

  async release(id: string, dto: ReleaseInventoryDto, adminId?: string) {
    const inventory = await this.inventoryRepo.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    const beforeReserved = inventory.reservedQuantity;
    const newReservedQuantity = inventory.reservedQuantity - dto.quantity;

    if (newReservedQuantity < 0) {
      throw new BadRequestException(
        'Cannot release more than reserved quantity',
      );
    }

    inventory.reservedQuantity = newReservedQuantity;
    inventory.availableQuantity =
      inventory.quantity - inventory.reservedQuantity;

    const updatedInventory = await this.inventoryRepo.save(inventory);

    await this.auditRepo.save(
      this.auditRepo.create({
        variantId: inventory.variantId,
        actionType: AuditActionType.RELEASE,
        beforeQuantity: beforeReserved,
        afterQuantity: newReservedQuantity,
        referenceType: 'order_release',
        performedBy: adminId ?? undefined,
        notes: `Released ${dto.quantity} units from reservation`,
      }),
    );

    await this.auditLogService.log({
      userId: adminId,
      action: 'STOCK_RELEASE',
      entityType: 'inventory',
      entityId: id,
      newValues: { reservedQuantity: newReservedQuantity, availableQuantity: inventory.quantity - newReservedQuantity },
      oldValues: { reservedQuantity: beforeReserved },
    });

    return this.toResponse(updatedInventory);
  }

  private toResponse(inventory: Inventory, productName?: string): InventoryResponseDto {
    return {
      id: inventory.id,
      variantId: inventory.variantId,
      variantSku: inventory.variant?.sku ?? '',
      productName,
      quantity: inventory.quantity,
      reservedQuantity: inventory.reservedQuantity,
      availableQuantity: inventory.availableQuantity,
      lowStockThreshold: inventory.lowStockThreshold,
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
    };
  }
}
