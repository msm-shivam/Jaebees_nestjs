import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { ReserveInventoryDto } from './dto/reserve-inventory.dto';
import { ReleaseInventoryDto } from './dto/release-inventory.dto';
import { InventoryResponseDto } from './dto/inventory-response.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  async create(dto: CreateInventoryDto) {
    // Validate variant exists
    const variant = await this.variantRepo.findOne({
      where: { id: dto.variantId },
    });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Check if inventory already exists for this variant
    const existingInventory = await this.inventoryRepo.findOne({
      where: { variantId: dto.variantId },
    });

    if (existingInventory) {
      throw new BadRequestException('Inventory already exists for this variant');
    }

    // Create inventory
    const inventory = this.inventoryRepo.create({
      variantId: dto.variantId,
      quantity: dto.quantity,
      reservedQuantity: dto.reservedQuantity || 0,
      availableQuantity: dto.quantity - (dto.reservedQuantity || 0),
      lowStockThreshold: dto.lowStockThreshold || 5,
    });

    const savedInventory = await this.inventoryRepo.save(inventory);
    return this.toResponse(savedInventory);
  }

  async findAll() {
    const inventories = await this.inventoryRepo.find({
      relations: { variant: true },
    });

    return inventories.map((inv) => this.toResponse(inv));
  }

  async findOne(id: string) {
    const inventory = await this.inventoryRepo.findOne({
      where: { id },
      relations: { variant: true },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    return this.toResponse(inventory);
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

  async update(id: string, dto: UpdateInventoryDto) {
    const inventory = await this.inventoryRepo.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    // Validate reserved quantity doesn't exceed quantity
    if (dto.quantity !== undefined && dto.reservedQuantity !== undefined) {
      if (dto.reservedQuantity > dto.quantity) {
        throw new BadRequestException('Reserved quantity cannot exceed total quantity');
      }
    } else if (dto.reservedQuantity !== undefined && dto.reservedQuantity > inventory.quantity) {
      throw new BadRequestException('Reserved quantity cannot exceed total quantity');
    }

    Object.assign(inventory, dto);

    // Recalculate available quantity
    inventory.availableQuantity = inventory.quantity - inventory.reservedQuantity;

    const updatedInventory = await this.inventoryRepo.save(inventory);
    return this.toResponse(updatedInventory);
  }

  async adjust(id: string, dto: AdjustInventoryDto) {
    const inventory = await this.inventoryRepo.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    const newQuantity = inventory.quantity + dto.quantity;

    if (newQuantity < 0) {
      throw new BadRequestException('Cannot reduce quantity below zero');
    }

    inventory.quantity = newQuantity;
    inventory.availableQuantity = inventory.quantity - inventory.reservedQuantity;

    const updatedInventory = await this.inventoryRepo.save(inventory);
    return this.toResponse(updatedInventory);
  }

  async reserve(id: string, dto: ReserveInventoryDto) {
    const inventory = await this.inventoryRepo.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    const newReservedQuantity = inventory.reservedQuantity + dto.quantity;

    if (newReservedQuantity > inventory.quantity) {
      throw new BadRequestException('Insufficient stock available');
    }

    inventory.reservedQuantity = newReservedQuantity;
    inventory.availableQuantity = inventory.quantity - inventory.reservedQuantity;

    const updatedInventory = await this.inventoryRepo.save(inventory);
    return this.toResponse(updatedInventory);
  }

  async release(id: string, dto: ReleaseInventoryDto) {
    const inventory = await this.inventoryRepo.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    const newReservedQuantity = inventory.reservedQuantity - dto.quantity;

    if (newReservedQuantity < 0) {
      throw new BadRequestException('Cannot release more than reserved quantity');
    }

    inventory.reservedQuantity = newReservedQuantity;
    inventory.availableQuantity = inventory.quantity - inventory.reservedQuantity;

    const updatedInventory = await this.inventoryRepo.save(inventory);
    return this.toResponse(updatedInventory);
  }

  private toResponse(inventory: Inventory): InventoryResponseDto {
    return {
      id: inventory.id,
      variantId: inventory.variantId,
      quantity: inventory.quantity,
      reservedQuantity: inventory.reservedQuantity,
      availableQuantity: inventory.availableQuantity,
      lowStockThreshold: inventory.lowStockThreshold,
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
    };
  }
}
