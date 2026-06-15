import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In, MoreThan, SelectQueryBuilder } from 'typeorm';
import { Product, ProductStatus } from '../../products/entities/product.entity';
import {
  ProductVariant,
  VariantStatus,
} from '../../product-variants/entities/product-variant.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { ProductCollection } from '../../collections/entities/product-collection.entity';
import { ProductVariantAttribute } from '../../product-variants/entities/product-variant-attribute.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { Category } from '../../categories/entities/category.entity';
import { Collection } from '../../collections/entities/collection.entity';
import { SubCategory } from '../../sub-categories/entities/sub-category.entity';
import { Attribute } from '../../attributes/entities/attribute.entity';
import { AttributeValue } from '../../attribute-values/entities/attribute-value.entity';
import {
  SearchQueryDto,
  SortOption,
  AvailabilityOption,
} from '../dto/search-query.dto';
import { SearchLog } from '../entities/search-log.entity';
import { SearchAnalyticsService } from './search-analytics.service';
import { paginate } from '../../../common/utils/pagination.util';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(ProductCollection)
    private readonly productCollectionRepo: Repository<ProductCollection>,
    @InjectRepository(ProductVariantAttribute)
    private readonly variantAttributeRepo: Repository<ProductVariantAttribute>,
    @InjectRepository(Attribute)
    private readonly attributeRepo: Repository<Attribute>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepo: Repository<AttributeValue>,
    private readonly searchAnalyticsService: SearchAnalyticsService,
  ) {}

  async search(query: SearchQueryDto, userId?: string, ipAddress?: string) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const sort = query.sort || SortOption.RELEVANCE;

    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'brand')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.subCategory', 'subCategory')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndMapMany(
        'p.variants',
        'p.variants',
        'v',
        'v.deleted_at IS NULL',
      )
      .leftJoin('v.inventories', 'inv')
      .leftJoin('product_collections', 'pc', 'pc.product_id = p.id')
      .leftJoin('collections', 'col', 'col.id = pc.collection_id')
      .where('p.deleted_at IS NULL')
      .andWhere('p.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('p.is_active = :isActive', { isActive: true });

    // Keyword search
    if (query.q) {
      const term = `%${query.q.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(p.name) LIKE :term OR LOWER(p.short_description) LIKE :term OR LOWER(p.description) LIKE :term OR LOWER(p.meta_keywords) LIKE :term OR LOWER(brand.name) LIKE :term OR LOWER(category.name) LIKE :term)',
        { term },
      );
    }

    // Category filter
    if (query.categoryIds?.length) {
      qb.andWhere('p.category_id IN (:...categoryIds)', {
        categoryIds: query.categoryIds,
      });
    }

    // Brand filter
    if (query.brandIds?.length) {
      qb.andWhere('p.brand_id IN (:...brandIds)', { brandIds: query.brandIds });
    }

    // Collection filter
    if (query.collectionIds?.length) {
      qb.andWhere('pc.collection_id IN (:...collectionIds)', {
        collectionIds: query.collectionIds,
      });
    }

    // Price range filter (via variants)
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      if (query.minPrice !== undefined && query.maxPrice !== undefined) {
        qb.andWhere('v.price BETWEEN :minPrice AND :maxPrice', {
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
        });
      } else if (query.minPrice !== undefined) {
        qb.andWhere('v.price >= :minPrice', { minPrice: query.minPrice });
      } else if (query.maxPrice !== undefined) {
        qb.andWhere('v.price <= :maxPrice', { maxPrice: query.maxPrice });
      }
    }

    // Rating filter (min/max)
    if (query.minRating !== undefined) {
      qb.andWhere('p.average_rating >= :minRating', {
        minRating: query.minRating,
      });
    }
    if (query.maxRating !== undefined) {
      qb.andWhere('p.average_rating <= :maxRating', {
        maxRating: query.maxRating,
      });
    }

    // Discount filter (min/max)
    if (query.minDiscount !== undefined) {
      qb.andWhere(
        'v.compare_at_price IS NOT NULL AND ((v.compare_at_price - v.price) / v.compare_at_price * 100) >= :minDiscount',
        { minDiscount: query.minDiscount },
      );
    }
    if (query.maxDiscount !== undefined) {
      qb.andWhere(
        'v.compare_at_price IS NOT NULL AND ((v.compare_at_price - v.price) / v.compare_at_price * 100) <= :maxDiscount',
        { maxDiscount: query.maxDiscount },
      );
    }

    // In stock filter
    if (query.inStock === true) {
      qb.andWhere('inv.available_quantity > 0');
    }

    // Has review filter
    if (query.hasReview === true) {
      qb.andWhere('p.total_reviews > 0');
    }

    // Featured filter
    if (query.isFeatured === true) {
      qb.andWhere('p.is_featured = true');
    }

    // New arrival filter (created within last 30 days)
    if (query.isNewArrival === true) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      qb.andWhere('p.created_at >= :newArrivalDate', {
        newArrivalDate: thirtyDaysAgo,
      });
    }

    // Best seller filter (total_reviews > 0 ordered by total_reviews — filter out low performers)
    if (query.isBestSeller === true) {
      qb.andWhere('p.total_reviews >= 10');
    }

    // On sale filter (any variant has compare_at_price > price)
    if (query.onSale === true) {
      qb.andWhere(
        'v.compare_at_price IS NOT NULL AND v.compare_at_price > v.price',
      );
    }

    // Dynamic attribute filters
    const attributeConditions: string[] = [];

    if (query.sizes?.length) {
      qb.andWhere(
        `p.id IN (SELECT v2.product_id FROM product_variants v2 JOIN product_variant_attributes pva2 ON pva2.variant_id = v2.id JOIN attribute_values av2 ON av2.id = pva2.attribute_value_id WHERE av2.value IN (:...sizes) AND v2.deleted_at IS NULL)`,
        { sizes: query.sizes },
      );
    }

    if (query.colors?.length) {
      qb.andWhere(
        `p.id IN (SELECT v3.product_id FROM product_variants v3 JOIN product_variant_attributes pva3 ON pva3.variant_id = v3.id JOIN attribute_values av3 ON av3.id = pva3.attribute_value_id WHERE av3.value IN (:...colors) AND v3.deleted_at IS NULL)`,
        { colors: query.colors },
      );
    }

    if (query.materials?.length) {
      qb.andWhere(
        `p.id IN (SELECT v4.product_id FROM product_variants v4 JOIN product_variant_attributes pva4 ON pva4.variant_id = v4.id JOIN attribute_values av4 ON av4.id = pva4.attribute_value_id WHERE av4.value IN (:...materials) AND v4.deleted_at IS NULL)`,
        { materials: query.materials },
      );
    }

    if (query.genders?.length) {
      qb.andWhere(
        `p.id IN (SELECT v5.product_id FROM product_variants v5 JOIN product_variant_attributes pva5 ON pva5.variant_id = v5.id JOIN attribute_values av5 ON av5.id = pva5.attribute_value_id WHERE av5.value IN (:...genders) AND v5.deleted_at IS NULL)`,
        { genders: query.genders },
      );
    }

    if (query.sports?.length) {
      qb.andWhere(
        `p.id IN (SELECT v6.product_id FROM product_variants v6 JOIN product_variant_attributes pva6 ON pva6.variant_id = v6.id JOIN attribute_values av6 ON av6.id = pva6.attribute_value_id WHERE av6.value IN (:...sports) AND v6.deleted_at IS NULL)`,
        { sports: query.sports },
      );
    }

    // Generic attribute value IDs filter
    if (query.attributeValueIds?.length) {
      qb.andWhere(
        `p.id IN (SELECT v7.product_id FROM product_variants v7 JOIN product_variant_attributes pva7 ON pva7.variant_id = v7.id WHERE pva7.attribute_value_id IN (:...attributeValueIds) AND v7.deleted_at IS NULL)`,
        { attributeValueIds: query.attributeValueIds },
      );
    }

    // Price buckets (facets: 0-500, 500-1000, 1000-2000, 2000+)
    if (query.priceBuckets?.length) {
      const bucketConditions = query.priceBuckets
        .map((bucket) => {
          const match = bucket.match(/^(\d+)-(\d+)\+?$/);
          if (match) {
            return { min: parseFloat(match[1]), max: parseFloat(match[2]) };
          }
          const matchOpen = bucket.match(/^(\d+)\+$/);
          if (matchOpen) {
            return { min: parseFloat(matchOpen[1]), max: Infinity };
          }
          const matchRange = bucket.match(/^(\d+)-(\d+)$/);
          if (matchRange) {
            return {
              min: parseFloat(matchRange[1]),
              max: parseFloat(matchRange[2]),
            };
          }
          return null;
        })
        .filter(Boolean) as { min: number; max: number }[];

      if (bucketConditions.length > 0) {
        const bucketSql = bucketConditions
          .map(
            (_, i) =>
              `(v.price >= :bucketMin${i} AND v.price <= :bucketMax${i})`,
          )
          .join(' OR ');
        const bucketParams = bucketConditions.reduce(
          (acc, b, i) => {
            acc[`bucketMin${i}`] = b.min;
            acc[`bucketMax${i}`] = b.max;
            return acc;
          },
          {} as Record<string, number>,
        );
        qb.andWhere(`(${bucketSql})`, bucketParams);
      }
    }

    // Availability filter
    if (query.availability) {
      switch (query.availability) {
        case AvailabilityOption.IN_STOCK:
          qb.andWhere('inv.available_quantity > 0');
          break;
        case AvailabilityOption.OUT_OF_STOCK:
          qb.andWhere(
            '(inv.available_quantity IS NULL OR inv.available_quantity <= 0)',
          );
          break;
        case AvailabilityOption.PREORDER:
          qb.andWhere('v.status = :preorderStatus', {
            preorderStatus: 'PREORDER',
          });
          break;
      }
    }

    // Tags filter (product_tags slug)
    if (query.tags?.length) {
      qb.andWhere(
        `p.id IN (SELECT ptm.product_id FROM product_tag_mappings ptm JOIN product_tags pt ON pt.id = ptm.tag_id WHERE pt.slug IN (:...tags))`,
        { tags: query.tags },
      );
    }

    // Created date range filter
    if (query.createdAfter) {
      qb.andWhere('p.created_at >= :createdAfter', {
        createdAfter: new Date(query.createdAfter),
      });
    }
    if (query.createdBefore) {
      qb.andWhere('p.created_at <= :createdBefore', {
        createdBefore: new Date(query.createdBefore),
      });
    }

    // Sorting
    switch (sort) {
      case SortOption.NEWEST:
        qb.orderBy('p.created_at', 'DESC');
        break;
      case SortOption.PRICE_ASC:
        qb.orderBy('v.price', 'ASC');
        break;
      case SortOption.PRICE_DESC:
        qb.orderBy('v.price', 'DESC');
        break;
      case SortOption.HIGHEST_RATED:
        qb.orderBy('p.average_rating', 'DESC');
        break;
      case SortOption.NAME_ASC:
        qb.orderBy('p.name', 'ASC');
        break;
      case SortOption.NAME_DESC:
        qb.orderBy('p.name', 'DESC');
        break;
      case SortOption.DISCOUNT_DESC:
        qb.orderBy('v.compare_at_price', 'DESC');
        break;
      case SortOption.RELEVANCE:
      default:
        if (query.q) {
          qb.orderBy(
            `CASE WHEN LOWER(p.name) LIKE :exactTerm THEN 0 ELSE 1 END`,
            'ASC',
          ).setParameter('exactTerm', `${query.q.toLowerCase()}%`);
          qb.addOrderBy('p.total_reviews', 'DESC');
        } else {
          qb.orderBy('p.created_at', 'DESC');
        }
        break;
    }

    // Get total count (without pagination)
    const total = await qb.getCount();

    // Apply pagination
    qb.skip(skip).take(limit);
    qb.select('DISTINCT p.id');

    // Get IDs only for pagination, then fetch full entities
    const rawIds = await qb.getRawMany();
    const ids = rawIds
      .map((r: any) => r.p_id || r.p_id || r.product_id || r.id)
      .filter(Boolean);

    let items: any[] = [];
    if (ids.length > 0) {
      items = await this.productRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.brand', 'brand')
        .leftJoinAndSelect('p.category', 'category')
        .leftJoinAndSelect('p.subCategory', 'subCategory')
        .leftJoinAndSelect('p.images', 'images')
        .leftJoinAndMapMany(
          'p.variants',
          'p.variants',
          'v',
          'v.deleted_at IS NULL',
        )
        .leftJoin('v.inventories', 'inv')
        .where('p.id IN (:...ids)', { ids })
        .andWhere('p.deleted_at IS NULL')
        .getMany();
      // Re-order to match pagination order
      const idOrder = new Map(ids.map((id, i) => [id, i]));
      items.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));
    }

    // Log the search
    if (query.q) {
      await this.searchAnalyticsService.logSearch({
        userId,
        keyword: query.q,
        resultsCount: total,
        ipAddress,
      });
    }

    return paginate(items, total, page, limit);
  }

  async getFilterOptions() {
    const categories = await this.categoryRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const brands = await this.brandRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const collections = await this.collectionRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const attributes = await this.attributeRepo.find({
      where: { isFilterable: true },
      relations: { values: true },
      order: { sortOrder: 'ASC' },
    });

    const filterableAttributes = attributes.map((attr) => ({
      id: attr.id,
      name: attr.name,
      slug: attr.slug,
      values: (attr.values ?? [])
        .filter((v) => !v.deletedAt)
        .map((v) => ({ id: v.id, value: v.value, slug: v.slug })),
    }));

    return {
      categories,
      brands,
      collections,
      attributes: filterableAttributes,
    };
  }
}
