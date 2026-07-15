import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan, Not } from 'typeorm';
import { Product, ProductStatus } from '../../products/entities/product.entity';
import {
  ProductVariant,
  VariantStatus,
} from '../../product-variants/entities/product-variant.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { ProductView } from '../entities/product-view.entity';
import { WishlistItem } from '../../wishlist/entities/wishlist-item.entity';
import { Review } from '../../reviews/entities/review.entity';

@Injectable()
export class DiscoveryService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(ProductView)
    private readonly productViewRepo: Repository<ProductView>,
    @InjectRepository(WishlistItem)
    private readonly wishlistItemRepo: Repository<WishlistItem>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  private async findProducts(ids: string[]): Promise<Product[]> {
    if (!ids.length) return [];
    const products = await this.productRepo.find({
      where: { id: In(ids), status: ProductStatus.ACTIVE, isActive: true },
      relations: { brand: true, category: true, images: true, variants: true },
    });
    return products.filter((p) => !p.deletedAt);
  }

  async getRelatedProducts(productId: string, limit = 12): Promise<Product[]> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: { variants: { attributes: true } },
    });
    if (!product) return [];

    const related = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'brand')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.variants', 'variants')
      .where('p.id != :productId', { productId })
      .andWhere('p.deleted_at IS NULL')
      .andWhere('p.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('p.is_active = :isActive', { isActive: true })
      .andWhere('(p.category_id = :catId OR p.brand_id = :brandId)', {
        catId: product.categoryId,
        brandId: product.brandId,
      })
      .addSelect(
        `CASE WHEN p.category_id = :catId2 AND p.brand_id = :brandId2 THEN 0 WHEN p.category_id = :catId3 THEN 1 ELSE 2 END`,
        'relevance_score',
      )
      .setParameters({
        catId2: product.categoryId,
        brandId2: product.brandId,
        catId3: product.categoryId,
      })
      .addOrderBy('relevance_score', 'ASC')
      .addOrderBy('p.average_rating', 'DESC')
      .take(limit)
      .getMany();

    return related;
  }

  async getAlsoViewed(productId: string, limit = 12): Promise<Product[]> {
    const views = await this.productViewRepo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    const userIds = [...new Set(views.map((v) => v.userId).filter(Boolean))];
    if (!userIds.length) return [];

    const otherViews = await this.productViewRepo.find({
      where: { userId: In(userIds), productId: Not(productId) },
      order: { createdAt: 'DESC' },
      take: limit * 2,
    });
    const productIds = [...new Set(otherViews.map((v) => v.productId))].slice(
      0,
      limit,
    );
    return this.findProducts(productIds);
  }

  async getFrequentlyBought(productId: string, limit = 12): Promise<Product[]> {
    const items = await this.orderItemRepo.find({
      where: { productId },
      take: 50,
    });
    const orderIds = [...new Set(items.map((i) => i.orderId))];
    if (!orderIds.length) return [];

    const boughtTogether = await this.orderItemRepo
      .createQueryBuilder('oi')
      .select('oi.product_id', 'productId')
      .addSelect('COUNT(*)', 'count')
      .where('oi.order_id IN (:...orderIds)', { orderIds })
      .andWhere('oi.product_id != :productId', { productId })
      .groupBy('oi.product_id')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    const productIds = boughtTogether.map((r: any) => r.productId);
    return this.findProducts(productIds);
  }

  async getTrendingProducts(limit = 20): Promise<Product[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const products = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'brand')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.variants', 'variants')
      .leftJoin(
        'product_views',
        'pv',
        'pv.product_id = p.id AND pv.created_at > :since',
      )
      .leftJoin(
        'order_items',
        'oi',
        'oi.product_id = p.id AND oi.created_at > :since2',
      )
      .leftJoin(
        'wishlist_items',
        'wi',
        'wi.product_id = p.id AND wi.created_at > :since3',
      )
      .where('p.deleted_at IS NULL')
      .andWhere('p.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('p.is_active = :isActive', { isActive: true })
      .andWhere('pv.created_at > :since', { since: thirtyDaysAgo })
      .andWhere('oi.created_at > :since2', { since2: thirtyDaysAgo })
      .andWhere('wi.created_at > :since3', { since3: thirtyDaysAgo })
      .groupBy('p.id')
      .addGroupBy('brand.id')
      .addGroupBy('category.id')
      .addSelect(
        'COUNT(DISTINCT pv.id) + COUNT(DISTINCT oi.id) + COUNT(DISTINCT wi.id)',
        'trending_score',
      )
      .orderBy('"trending_score"', 'DESC')
      .take(limit)
      .getMany();

    return products;
  }

  async getFeaturedProducts(limit = 20): Promise<Product[]> {
    return this.productRepo.find({
      where: {
        isFeatured: true,
        status: ProductStatus.ACTIVE,
        isActive: true,
      },
      relations: { brand: true, category: true, images: true, variants: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getNewArrivals(limit = 20): Promise<Product[]> {
    return this.productRepo.find({
      where: {
        status: ProductStatus.ACTIVE,
        isActive: true,
      },
      relations: { brand: true, category: true, images: true, variants: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getRecentlyViewed(userId: string, limit = 20): Promise<Product[]> {
    const views = await this.productViewRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    const seen = new Set<string>();
    const productIds: string[] = [];
    for (const v of views) {
      if (!seen.has(v.productId)) {
        seen.add(v.productId);
        productIds.push(v.productId);
      }
    }
    return this.findProducts(productIds);
  }

  async getRecommended(userId: string, limit = 20): Promise<Product[]> {
    const views = await this.productViewRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    const viewedProductIds = [...new Set(views.map((v) => v.productId))];

    if (viewedProductIds.length > 0) {
      const categories = await this.productRepo
        .createQueryBuilder('p')
        .select('p.category_id')
        .where('p.id IN (:...ids)', { ids: viewedProductIds })
        .groupBy('p.category_id')
        .orderBy('COUNT(*)', 'DESC')
        .getRawMany();
      const topCategoryIds = categories
        .map((c: any) => c.p_category_id)
        .filter(Boolean);
      if (topCategoryIds.length > 0) {
        return this.productRepo
          .createQueryBuilder('p')
          .leftJoinAndSelect('p.brand', 'brand')
          .leftJoinAndSelect('p.category', 'category')
          .leftJoinAndSelect('p.images', 'images')
          .leftJoinAndSelect('p.variants', 'variants')
          .where('p.deleted_at IS NULL')
          .andWhere('p.status = :status', { status: ProductStatus.ACTIVE })
          .andWhere('p.is_active = :isActive', { isActive: true })
          .andWhere('p.id NOT IN (:...excludeIds)', {
            excludeIds: viewedProductIds,
          })
          .andWhere('p.category_id IN (:...catIds)', { catIds: topCategoryIds })
          .orderBy('p.average_rating', 'DESC')
          .take(limit)
          .getMany();
      }
    }

    return this.getTrendingProducts(limit);
  }

  async getSimilar(productId: string, limit = 12): Promise<Product[]> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) return [];

    return this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'brand')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.variants', 'variants')
      .where('p.id != :productId', { productId })
      .andWhere('p.deleted_at IS NULL')
      .andWhere('p.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('p.is_active = :isActive', { isActive: true })
      .andWhere('p.category_id = :catId', { catId: product.categoryId })
      .andWhere('p.brand_id = :brandId', { brandId: product.brandId })
      .orderBy('p.average_rating', 'DESC')
      .take(limit)
      .getMany();
  }

  async getRecentTrending(limit = 20): Promise<Product[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const products = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'brand')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.variants', 'variants')
      .leftJoin(
        'product_views',
        'pv',
        'pv.product_id = p.id AND pv.created_at > :since',
      )
      .leftJoin(
        'order_items',
        'oi',
        'oi.product_id = p.id AND oi.created_at > :since2',
      )
      .where('p.deleted_at IS NULL')
      .andWhere('p.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('p.is_active = :isActive', { isActive: true })
      .andWhere('pv.created_at > :since', { since: sevenDaysAgo })
      .andWhere('oi.created_at > :since2', { since2: sevenDaysAgo })
      .groupBy('p.id')
      .addGroupBy('brand.id')
      .addGroupBy('category.id')
      .addSelect(
        'COUNT(DISTINCT pv.id) + COUNT(DISTINCT oi.id)',
        'trending_score',
      )
      .orderBy('"trending_score"', 'DESC')
      .take(limit)
      .getMany();

    return products;
  }

  async getTopRated(limit = 20): Promise<Product[]> {
    return this.productRepo.find({
      where: { status: ProductStatus.ACTIVE, isActive: true },
      relations: { brand: true, category: true, images: true, variants: true },
      order: { averageRating: 'DESC' },
      take: limit,
    });
  }

  async getOnSale(limit = 20): Promise<Product[]> {
    const products = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'brand')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.variants', 'variants')
      .where('p.deleted_at IS NULL')
      .andWhere('p.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('p.is_active = :isActive', { isActive: true })
      .andWhere('variants.compare_at_price > variants.price')
      .orderBy('p.average_rating', 'DESC')
      .take(limit)
      .getMany();

    return products;
  }

  async getSeasonal(limit = 20): Promise<Product[]> {
    const now = new Date();
    const month = now.getMonth();
    let seasonKeywords: string[];
    if (month >= 2 && month <= 4) {
      seasonKeywords = ['spring', 'summer'];
    } else if (month >= 5 && month <= 7) {
      seasonKeywords = ['summer', 'beach', 'outdoor'];
    } else if (month >= 8 && month <= 10) {
      seasonKeywords = ['fall', 'autumn', 'winter'];
    } else {
      seasonKeywords = ['winter', 'snow', 'indoor'];
    }

    const conditions = seasonKeywords
      .map(
        (_, i) =>
          `(LOWER(p.name) LIKE :kw${i} OR LOWER(p.description) LIKE :kw${i} OR LOWER(p.short_description) LIKE :kw${i} OR LOWER(p.meta_keywords) LIKE :kw${i})`,
      )
      .join(' OR ');

    const params = seasonKeywords.reduce(
      (acc, kw, i) => {
        acc[`kw${i}`] = `%${kw}%`;
        return acc;
      },
      {} as Record<string, string>,
    );

    return this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'brand')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.variants', 'variants')
      .where('p.deleted_at IS NULL')
      .andWhere('p.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('p.is_active = :isActive', { isActive: true })
      .andWhere(`(${conditions})`, params)
      .orderBy('p.average_rating', 'DESC')
      .take(limit)
      .getMany();
  }

  async recordView(
    userId: string | undefined,
    productId: string,
  ): Promise<void> {
    if (!userId) return;
    const existing = await this.productViewRepo.findOne({
      where: { userId, productId },
      order: { createdAt: 'DESC' },
    });
    if (existing) {
      const minutesAgo = (Date.now() - existing.createdAt.getTime()) / 60000;
      if (minutesAgo < 30) return;
    }
    await this.productViewRepo.save(
      this.productViewRepo.create({ userId, productId }),
    );
  }
}
