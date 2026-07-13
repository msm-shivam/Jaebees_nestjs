import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Collection } from './entities/collection.entity';
import { ProductCollection } from './entities/product-collection.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionQueryDto } from './dto/collection-query.dto';
import { CollectionResponseDto } from './dto/collection-response.dto';
import { toSlug } from '../../common/utils/slug.util';
import { paginate } from '../../common/utils/pagination.util';
import { CatalogMessages } from '../../common/constants/messages.constants';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(ProductCollection)
    private readonly productCollectionRepo: Repository<ProductCollection>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(
    dto: CreateCollectionDto,
    image?: Express.Multer.File,
  ): Promise<{ message: string; data: CollectionResponseDto }> {
    const slug = dto.slug ?? toSlug(dto.name);
    await this.ensureSlugUnique(slug);

    const collection = this.collectionRepo.create({
      name: dto.name,
      slug,
      image: image?.filename ? `/uploads/collections/${image.filename}` : (dto.image ?? null),
      description: dto.description ?? null,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.collectionRepo.save(collection);

    if (dto.productIds?.length) {
      const junctions = dto.productIds.map((productId) =>
        this.productCollectionRepo.create({ productId, collectionId: saved.id }),
      );
      await this.productCollectionRepo.save(junctions);
    }

    saved.productCount = dto.productIds?.length ?? 0;
    return {
      message: 'Collection created successfully.',
      data: this.toResponse(saved),
    };
  }

  async findAll(query: CollectionQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = {};
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) where.name = ILike(`%${query.search}%`);

    const [items, total] = await this.collectionRepo.findAndCount({
      where,
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const ids = items.map((c) => c.id);
    const counts: Record<string, number> = {};
    if (ids.length) {
      const rows = await this.productCollectionRepo
        .createQueryBuilder('pc')
        .select('pc.collection_id', 'collectionId')
        .addSelect('COUNT(*)', 'cnt')
        .where('pc.collection_id IN (:...ids)', { ids })
        .groupBy('pc.collection_id')
        .getRawMany<{ collectionId: string; cnt: string }>();
      for (const row of rows) {
        counts[row.collectionId] = Number(row.cnt);
      }
    }
    for (const item of items) {
      item.productCount = counts[item.id] ?? 0;
    }

    const [totalCollections, activeCollections, inactiveCollections] =
      await Promise.all([
        this.collectionRepo.count(),
        this.collectionRepo.count({ where: { isActive: true } }),
        this.collectionRepo.count({ where: { isActive: false } }),
      ]);

    return {
      ...paginate(
        items.map((item) => this.toResponse(item)),
        total,
        page,
        limit,
      ),
      totalCollections,
      activeCollections,
      inactiveCollections,
    };
  }

  async findOne(id: string): Promise<any> {
    const collection = await this.findByIdOrFail(id);

    const junctions = await this.productCollectionRepo.find({
      where: { collectionId: id },
    });

    collection.productCount = junctions.length;

    const result = this.toResponse(collection) as any;

    if (junctions.length > 0) {
      const productIds = junctions.map((j) => j.productId);
      const products = await this.productRepo.find({
        where: { id: In(productIds) },
        relations: { images: true, variants: true },
      });
      result.products = products.map((p) => {
        const defaultVariant = (p.variants ?? []).find((v) => v.isDefault) ?? (p.variants ?? [])[0];
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          status: p.status,
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          shortDescription: p.shortDescription,
          brandId: p.brandId,
          categoryId: p.categoryId,
          averageRating: p.averageRating,
          price: defaultVariant ? Number(defaultVariant.price) : null,
          compareAtPrice: defaultVariant ? Number(defaultVariant.compareAtPrice) : null,
          createdAt: p.createdAt,
          images: (p.images ?? []).map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary,
          })),
        };
      });
    } else {
      result.products = [];
    }

    return result;
  }

  async update(
    id: string,
    dto: UpdateCollectionDto,
    image?: Express.Multer.File,
  ): Promise<{ message: string; data: CollectionResponseDto }> {
    const collection = await this.findByIdOrFail(id);

    if (dto.slug && dto.slug !== collection.slug) {
      await this.ensureSlugUnique(dto.slug, id);
      collection.slug = dto.slug;
    } else if (dto.name && !dto.slug && dto.name !== collection.name) {
      const newSlug = toSlug(dto.name);
      if (newSlug !== collection.slug) {
        await this.ensureSlugUnique(newSlug, id);
        collection.slug = newSlug;
      }
    }

    if (dto.name !== undefined) collection.name = dto.name;
    if (image?.filename) collection.image = `/uploads/collections/${image.filename}`;
    else if (dto.image !== undefined) collection.image = dto.image;
    if (dto.description !== undefined) collection.description = dto.description;
    if (dto.isActive !== undefined) collection.isActive = dto.isActive;

    const saved = await this.collectionRepo.save(collection);

    if (dto.productIds !== undefined) {
      await this.productCollectionRepo.delete({ collectionId: id });
      if (dto.productIds.length) {
        const junctions = dto.productIds.map((productId) =>
          this.productCollectionRepo.create({ productId, collectionId: id }),
        );
        await this.productCollectionRepo.save(junctions);
      }
    }

    saved.productCount = dto.productIds !== undefined
      ? dto.productIds.length
      : await this.productCollectionRepo.count({ where: { collectionId: id } });
    return {
      message: 'Collection updated successfully.',
      data: this.toResponse(saved),
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const collection = await this.findByIdOrFail(id);
    await this.collectionRepo.softRemove(collection);
    return { message: 'Collection deleted successfully.' };
  }

  private async findByIdOrFail(id: string): Promise<Collection> {
    const collection = await this.collectionRepo.findOne({ where: { id } });
    if (!collection) {
      throw new NotFoundException(CatalogMessages.COLLECTION_NOT_FOUND);
    }
    return collection;
  }

  private async ensureSlugUnique(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.collectionRepo.findOne({ where: { slug }, withDeleted: true });
    if (!existing) return;
    if (existing.id === excludeId) return;
    if (existing.deletedAt) {
      await this.collectionRepo.remove(existing);
      return;
    }
    throw new BadRequestException(CatalogMessages.COLLECTION_SLUG_EXISTS);
  }

  private toResponse(collection: Collection): CollectionResponseDto {
    return plainToInstance(CollectionResponseDto, collection, {
      excludeExtraneousValues: true,
    });
  }
}
