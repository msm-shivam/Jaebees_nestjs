import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto, CartItemResponseDto } from './dto/cart-response.dto';
import {
  ProductVariant,
  VariantStatus,
} from '../product-variants/entities/product-variant.entity';
import { Product, ProductStatus } from '../products/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  async getCart(
    userId: string,
  ): Promise<{ message: string; data: CartResponseDto }> {
    const cart = await this.getOrCreateCart(userId);
    return {
      message: 'Cart retrieved successfully.',
      data: this.toResponse(cart),
    };
  }

  async addItem(
    userId: string,
    dto: AddCartItemDto,
  ): Promise<{ message: string; data: CartResponseDto }> {
    const variant = await this.findVariantOrFail(dto.variantId);
    this.validateVariant(variant);

    const inventory = await this.inventoryRepo.findOne({
      where: { variantId: dto.variantId },
    });
    if (!inventory) {
      throw new BadRequestException('Inventory missing for this variant.');
    }
    if (dto.quantity > inventory.availableQuantity) {
      throw new BadRequestException('Insufficient stock.');
    }

    let cart = await this.cartRepo.findOne({
      where: { userId },
      relations: { items: true },
    });
    if (!cart) {
      cart = this.cartRepo.create({
        userId,
        items: [],
        subtotal: 0,
        totalItems: 0,
      });
      cart = await this.cartRepo.save(cart);
    }

    const existingItem = cart.items?.find((i) => i.variantId === dto.variantId);
    if (existingItem) {
      const newQty = existingItem.quantity + dto.quantity;
      if (newQty > inventory.availableQuantity) {
        throw new BadRequestException('Insufficient stock.');
      }
      existingItem.quantity = newQty;
      existingItem.lineTotal = Number(
        (newQty * Number(variant.price)).toFixed(2),
      );
      await this.cartItemRepo.save(existingItem);
    } else {
      const lineTotal = Number(
        (dto.quantity * Number(variant.price)).toFixed(2),
      );
      const item = this.cartItemRepo.create({
        cartId: cart.id,
        variantId: dto.variantId,
        quantity: dto.quantity,
        unitPrice: Number(variant.price),
        lineTotal,
      });
      await this.cartItemRepo.save(item);
    }

    cart = await this.recalculateCart(cart.id);
    return {
      message: 'Item added to cart successfully.',
      data: this.toResponse(cart),
    };
  }

  async updateItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<{ message: string; data: CartResponseDto }> {
    const cart = await this.getUserCartOrFail(userId);
    const item = cart.items?.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Cart item not found.');

    const inventory = await this.inventoryRepo.findOne({
      where: { variantId: item.variantId },
    });
    if (!inventory) {
      throw new BadRequestException('Inventory missing for this variant.');
    }
    if (dto.quantity > inventory.availableQuantity) {
      throw new BadRequestException('Insufficient stock.');
    }

    item.quantity = dto.quantity;
    item.lineTotal = Number((dto.quantity * Number(item.unitPrice)).toFixed(2));
    await this.cartItemRepo.save(item);

    const updatedCart = await this.recalculateCart(cart.id);
    return {
      message: 'Cart item updated successfully.',
      data: this.toResponse(updatedCart),
    };
  }

  async removeItem(
    userId: string,
    itemId: string,
  ): Promise<{ message: string; data: CartResponseDto }> {
    const cart = await this.getUserCartOrFail(userId);
    const item = cart.items?.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Cart item not found.');

    await this.cartItemRepo.remove(item);

    const updatedCart = await this.recalculateCart(cart.id);
    return {
      message: 'Item removed from cart successfully.',
      data: this.toResponse(updatedCart),
    };
  }

  async clearCart(
    userId: string,
  ): Promise<{ message: string; data: CartResponseDto }> {
    const cart = await this.getUserCartOrFail(userId);
    if (cart.items?.length > 0) {
      await this.cartItemRepo.remove(cart.items);
    }

    cart.subtotal = 0;
    cart.totalItems = 0;
    await this.cartRepo.save(cart);

    const cleared = await this.getUserCartOrFail(userId);
    return {
      message: 'Cart cleared successfully.',
      data: this.toResponse(cleared),
    };
  }

  async recalculateCart(cartId: string): Promise<Cart> {
    const items = await this.cartItemRepo.find({ where: { cartId } });

    const subtotal = Number(
      items.reduce((sum, item) => sum + Number(item.lineTotal), 0).toFixed(2),
    );
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    await this.cartRepo.update(cartId, { subtotal, totalItems });
    return this.cartRepo.findOne({
      where: { id: cartId },
      relations: { items: true },
    }) as Promise<Cart>;
  }

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { userId },
      relations: { items: true },
    });
    if (!cart) {
      cart = this.cartRepo.create({
        userId,
        items: [],
        subtotal: 0,
        totalItems: 0,
      });
      cart = await this.cartRepo.save(cart);
    }
    return cart;
  }

  private async getUserCartOrFail(userId: string): Promise<Cart> {
    const cart = await this.cartRepo.findOne({
      where: { userId },
      relations: { items: true },
    });
    if (!cart) throw new NotFoundException('Cart not found.');
    return cart;
  }

  private async findVariantOrFail(variantId: string): Promise<ProductVariant> {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
      relations: { product: true },
    });
    if (!variant) throw new NotFoundException('Variant not found.');
    return variant;
  }

  private validateVariant(variant: ProductVariant): void {
    if (variant.status !== VariantStatus.ACTIVE) {
      throw new BadRequestException('Variant not available.');
    }

    if (variant.product?.status === ProductStatus.ARCHIVED) {
      throw new BadRequestException(
        'Product is archived and cannot be added to cart.',
      );
    }
  }

  private toResponse(cart: Cart): CartResponseDto {
    return plainToInstance(CartResponseDto, {
      ...cart,
      items: (cart.items ?? []).map((item) =>
        plainToInstance(CartItemResponseDto, item, {
          excludeExtraneousValues: true,
        }),
      ),
    });
  }
}
