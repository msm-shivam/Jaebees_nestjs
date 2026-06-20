import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Product, ProductStatus } from '../products/entities/product.entity';
import {
  ProductVariant,
  VariantStatus,
} from '../product-variants/entities/product-variant.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { CartService } from '../cart/cart.service';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { User } from '../users/entities/user.entity';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(WishlistItem)
    private readonly wishlistItemRepository: Repository<WishlistItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly cartService: CartService,
  ) {}

  private async getOrCreateWishlist(userId: string): Promise<Wishlist> {
    let wishlist = await this.wishlistRepository.findOne({
      where: { userId },
      relations: { items: { product: true, variant: true } },
      withDeleted: false,
    });
    if (!wishlist) {
      wishlist = this.wishlistRepository.create({ userId, totalItems: 0 });
      wishlist = await this.wishlistRepository.save(wishlist);
      wishlist.items = [];
    }
    return wishlist;
  }

  async getWishlist(userId: string): Promise<Wishlist> {
    return this.getOrCreateWishlist(userId);
  }

  async addItem(userId: string, dto: CreateWishlistItemDto): Promise<Wishlist> {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException('Product is not available for wishlist');
    }

    if (dto.variantId) {
      const variant = await this.variantRepository.findOne({
        where: { id: dto.variantId },
        relations: { product: true },
      });
      if (!variant) {
        throw new NotFoundException('Variant not found');
      }
      if (variant.productId !== dto.productId) {
        throw new BadRequestException(
          'Variant does not belong to this product',
        );
      }
      if (variant.status !== VariantStatus.ACTIVE) {
        throw new BadRequestException('Variant is not available');
      }
    }

    const wishlist = await this.getOrCreateWishlist(userId);

    const existing = await this.wishlistItemRepository.findOne({
      where: {
        wishlistId: wishlist.id,
        productId: dto.productId,
        variantId: dto.variantId ?? IsNull(),
      },
    });
    if (existing) {
      return this.getOrCreateWishlist(userId);
    }

    const item = this.wishlistItemRepository.create({
      wishlistId: wishlist.id,
      productId: dto.productId,
      variantId: dto.variantId,
    });
    await this.wishlistItemRepository.save(item);

    wishlist.totalItems = await this.wishlistItemRepository.count({
      where: { wishlistId: wishlist.id },
    });
    await this.wishlistRepository.save(wishlist);

    return this.getOrCreateWishlist(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<Wishlist> {
    const wishlist = await this.getOrCreateWishlist(userId);
    const item = await this.wishlistItemRepository.findOne({
      where: { id: itemId, wishlistId: wishlist.id },
    });
    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }
    await this.wishlistItemRepository.softRemove(item);

    wishlist.totalItems = await this.wishlistItemRepository.count({
      where: { wishlistId: wishlist.id },
    });
    await this.wishlistRepository.save(wishlist);

    return this.getOrCreateWishlist(userId);
  }

  async moveToCart(
    userId: string,
    itemId: string,
  ): Promise<{ message: string }> {
    const wishlist = await this.getOrCreateWishlist(userId);
    const item = await this.wishlistItemRepository.findOne({
      where: { id: itemId, wishlistId: wishlist.id },
      relations: { variant: true, product: true },
    });
    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }

    const targetVariantId = item.variantId || item.productId;

    const variant = await this.variantRepository.findOne({
      where: { id: targetVariantId },
      relations: { product: true },
    });
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }
    if (variant.status !== VariantStatus.ACTIVE) {
      throw new BadRequestException('Variant is not available for purchase');
    }

    const inventory = await this.inventoryRepository.findOne({
      where: { variantId: targetVariantId },
    });
    if (!inventory || inventory.availableQuantity < 1) {
      throw new BadRequestException('Item is out of stock');
    }

    await this.cartService.addItem(userId, {
      variantId: targetVariantId,
      quantity: 1,
    });
    await this.wishlistItemRepository.softRemove(item);

    wishlist.totalItems = await this.wishlistItemRepository.count({
      where: { wishlistId: wishlist.id },
    });
    await this.wishlistRepository.save(wishlist);

    return { message: 'Item moved to cart successfully' };
  }

  async saveForLater(userId: string, cartItemId: string): Promise<Wishlist> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: { items: { variant: { product: true } } },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    const cartItem = cart.items?.find((i) => i.id === cartItemId);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    const wishlist = await this.getOrCreateWishlist(userId);

    const existing = await this.wishlistItemRepository.findOne({
      where: {
        wishlistId: wishlist.id,
        productId: cartItem.variant.productId,
        variantId: cartItem.variantId,
      },
    });
    if (!existing) {
      const newItem = this.wishlistItemRepository.create({
        wishlistId: wishlist.id,
        productId: cartItem.variant.productId,
        variantId: cartItem.variantId,
      });
      await this.wishlistItemRepository.save(newItem);

      wishlist.totalItems = await this.wishlistItemRepository.count({
        where: { wishlistId: wishlist.id },
      });
      await this.wishlistRepository.save(wishlist);
    }

    await this.cartItemRepository.remove(cartItem);
    await this.cartService.recalculateCart(cart.id);

    return this.getOrCreateWishlist(userId);
  }

  async clearWishlist(userId: string): Promise<Wishlist> {
    const wishlist = await this.getOrCreateWishlist(userId);
    if (wishlist.items?.length > 0) {
      await this.wishlistItemRepository.softRemove(wishlist.items);
    }
    wishlist.totalItems = 0;
    await this.wishlistRepository.save(wishlist);
    return this.getOrCreateWishlist(userId);
  }

  async deleteWishlist(userId: string): Promise<void> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { userId },
    });
    if (wishlist) {
      await this.wishlistRepository.softRemove(wishlist);
    }
  }

  async getWishlistByUserId(userId: string): Promise<{ user: { id: string; firstName: string; lastName: string; email: string }; totalItems: number; items: WishlistItem[] }> {
    const user = await this.wishlistRepository.manager.getRepository(User).findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const wishlist = await this.getOrCreateWishlist(userId);
    return {
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
      totalItems: wishlist.totalItems,
      items: wishlist.items || [],
    };
  }
}
