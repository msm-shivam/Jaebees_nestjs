import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Product, ProductStatus } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { ProductImageResponseDto } from './dto/product-image-response.dto';
import { toSlug } from '../../common/utils/slug.util';
import { paginate } from '../../common/utils/pagination.util';
import { CatalogMessages } from '../../common/constants/messages.constants';
import { Brand } from '../brands/entities/brand.entity';
import { Category } from '../categories/entities/category.entity';
import { SubCategory } from '../sub-categories/entities/sub-category.entity';
import { ProductCollection } from '../collections/entities/product-collection.entity';
import { ProductTagMapping } from '../product-tags/entities/product-tag-mapping.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepo: Repository<ProductImage>,
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,
    @InjectRepository(ProductCollection)
    private readonly productCollectionRepo: Repository<ProductCollection>,
    @InjectRepository(ProductTagMapping)
    private readonly productTagMappingRepo: Repository<ProductTagMapping>,
  ) {}

  async create(
    dto: CreateProductDto,
  ): Promise<{ message: string; data: ProductResponseDto }> {
    // Validate Brand
    const brand = await this.brandRepo.findOne({ where: { id: dto.brandId } });
    if (!brand) throw new BadRequestException('Brand not found.');

    // Validate Category
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) throw new BadRequestException('Category not found.');

    // Validate SubCategory
    const subCategory = await this.subCategoryRepo.findOne({
      where: { id: dto.subCategoryId },
    });
    if (!subCategory) throw new BadRequestException('Sub Category not found.');

    // Validate SubCategory belongs to Category
    if (subCategory.categoryId !== dto.categoryId) {
      throw new BadRequestException(
        'Sub Category does not belong to the specified Category.',
      );
    }

    // Generate slug
    const slug = await this.generateUniqueSlug(dto.slug ?? toSlug(dto.name));

    const product = this.productRepo.create({
      brandId: dto.brandId,
      categoryId: dto.categoryId,
      subCategoryId: dto.subCategoryId,
      name: dto.name,
      slug,
      skuPrefix: dto.skuPrefix ?? null,
      shortDescription: dto.shortDescription ?? null,
      description: dto.description ?? null,
      status: dto.status,
      metaTitle: dto.metaTitle ?? null,
      metaDescription: dto.metaDescription ?? null,
      metaKeywords: dto.metaKeywords ?? null,
      isFeatured: dto.isFeatured ?? false,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.productRepo.save(product);

    // Assign collections if provided
    if (dto.collectionIds && dto.collectionIds.length > 0) {
      await this.assignCollections(saved.id, dto.collectionIds);
    }

    // Assign tags if provided
    if (dto.tagIds && dto.tagIds.length > 0) {
      await this.assignTags(saved.id, dto.tagIds);
    }

    return {
      message: 'Product created successfully.',
      data: this.toResponse(saved),
    };
  }

  async findAll(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? 'name';
    const sortOrder = query.sortOrder ?? 'ASC';

    const queryBuilder = this.productRepo.createQueryBuilder('product');

    // Search filter
    if (query.search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.shortDescription ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Status filter
    if (query.status) {
      queryBuilder.andWhere('product.status = :status', {
        status: query.status,
      });
    }

    // Brand filter
    if (query.brandId) {
      queryBuilder.andWhere('product.brandId = :brandId', {
        brandId: query.brandId,
      });
    }

    // Category filter
    if (query.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    // Sub-category filter
    if (query.subCategoryId) {
      queryBuilder.andWhere('product.subCategoryId = :subCategoryId', {
        subCategoryId: query.subCategoryId,
      });
    }

    // Featured filter
    if (query.isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', {
        isFeatured: query.isFeatured,
      });
    }

    // Active filter
    if (query.isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    // Sorting
    const validSortFields = ['name', 'createdAt', 'updatedAt', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    queryBuilder.orderBy({ [`product.${sortField}`]: sortOrder });

    // Pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return paginate(
      items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.findByIdOrFail(id);
    return this.toResponse(product);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<{ message: string; data: ProductResponseDto }> {
    const product = await this.findByIdOrFail(id);

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.skuPrefix !== undefined) product.skuPrefix = dto.skuPrefix;
    if (dto.shortDescription !== undefined)
      product.shortDescription = dto.shortDescription;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.status !== undefined) product.status = dto.status;
    if (dto.metaTitle !== undefined) product.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined)
      product.metaDescription = dto.metaDescription;
    if (dto.metaKeywords !== undefined) product.metaKeywords = dto.metaKeywords;
    if (dto.isFeatured !== undefined) product.isFeatured = dto.isFeatured;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;

    const saved = await this.productRepo.save(product);
    return {
      message: 'Product updated successfully.',
      data: this.toResponse(saved),
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.findByIdOrFail(id);
    await this.productRepo.softRemove(product);
    return { message: 'Product deleted successfully.' };
  }

  async publish(
    id: string,
  ): Promise<{ message: string; data: ProductResponseDto }> {
    const product = await this.findByIdOrFail(id);
    product.status = ProductStatus.ACTIVE;
    const saved = await this.productRepo.save(product);
    return {
      message: 'Product published successfully.',
      data: this.toResponse(saved),
    };
  }

  async archive(
    id: string,
  ): Promise<{ message: string; data: ProductResponseDto }> {
    const product = await this.findByIdOrFail(id);
    product.status = ProductStatus.ARCHIVED;
    const saved = await this.productRepo.save(product);
    return {
      message: 'Product archived successfully.',
      data: this.toResponse(saved),
    };
  }

  // ─── Collections ────────────────────────────────────────────────────────────

  async assignCollections(
    productId: string,
    collectionIds: string[],
  ): Promise<{ message: string }> {
    await this.findByIdOrFail(productId);

    // Check for duplicates
    for (const collectionId of collectionIds) {
      const existing = await this.productCollectionRepo.findOne({
        where: { productId, collectionId },
      });
      if (existing) {
        throw new BadRequestException(
          `Collection ${collectionId} is already assigned to this product.`,
        );
      }
    }

    const mappings = collectionIds.map((collectionId) =>
      this.productCollectionRepo.create({ productId, collectionId }),
    );
    await this.productCollectionRepo.save(mappings);

    return { message: 'Collections assigned successfully.' };
  }

  async removeCollection(
    productId: string,
    collectionId: string,
  ): Promise<{ message: string }> {
    await this.findByIdOrFail(productId);

    const mapping = await this.productCollectionRepo.findOne({
      where: { productId, collectionId },
    });
    if (!mapping) {
      throw new NotFoundException('Collection mapping not found.');
    }

    await this.productCollectionRepo.remove(mapping);
    return { message: 'Collection removed successfully.' };
  }

  // ─── Tags ──────────────────────────────────────────────────────────────────

  async assignTags(
    productId: string,
    tagIds: string[],
  ): Promise<{ message: string }> {
    await this.findByIdOrFail(productId);

    // Check for duplicates
    for (const tagId of tagIds) {
      const existing = await this.productTagMappingRepo.findOne({
        where: { productId, tagId },
      });
      if (existing) {
        throw new BadRequestException(
          `Tag ${tagId} is already assigned to this product.`,
        );
      }
    }

    const mappings = tagIds.map((tagId) =>
      this.productTagMappingRepo.create({ productId, tagId }),
    );
    await this.productTagMappingRepo.save(mappings);

    return { message: 'Tags assigned successfully.' };
  }

  async removeTag(
    productId: string,
    tagId: string,
  ): Promise<{ message: string }> {
    await this.findByIdOrFail(productId);

    const mapping = await this.productTagMappingRepo.findOne({
      where: { productId, tagId },
    });
    if (!mapping) {
      throw new NotFoundException('Tag mapping not found.');
    }

    await this.productTagMappingRepo.remove(mapping);
    return { message: 'Tag removed successfully.' };
  }

  // ─── Product Images ────────────────────────────────────────────────────────

  async addImage(
    dto: CreateProductImageDto,
  ): Promise<{ message: string; data: ProductImageResponseDto }> {
    await this.findByIdOrFail(dto.productId);

    const image = this.productImageRepo.create({
      productId: dto.productId,
      imageUrl: dto.imageUrl,
      altText: dto.altText ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isPrimary: dto.isPrimary ?? false,
    });

    const saved = await this.productImageRepo.save(image);
    return {
      message: 'Image added successfully.',
      data: this.imageToResponse(saved),
    };
  }

  async getImages(
    productId: string,
  ): Promise<{ message: string; data: ProductImageResponseDto[] }> {
    await this.findByIdOrFail(productId);

    const images = await this.productImageRepo.find({
      where: { productId },
      order: { sortOrder: 'ASC' },
    });

    return {
      message: 'Images retrieved successfully.',
      data: images.map((img) => this.imageToResponse(img)),
    };
  }

  async updateImage(
    imageId: string,
    dto: UpdateProductImageDto,
  ): Promise<{ message: string; data: ProductImageResponseDto }> {
    const image = await this.productImageRepo.findOne({
      where: { id: imageId },
    });
    if (!image) throw new NotFoundException('Product image not found.');

    if (dto.imageUrl !== undefined) image.imageUrl = dto.imageUrl;
    if (dto.altText !== undefined) image.altText = dto.altText;
    if (dto.sortOrder !== undefined) image.sortOrder = dto.sortOrder;

    const saved = await this.productImageRepo.save(image);
    return {
      message: 'Image updated successfully.',
      data: this.imageToResponse(saved),
    };
  }

  async removeImage(imageId: string): Promise<{ message: string }> {
    const image = await this.productImageRepo.findOne({
      where: { id: imageId },
    });
    if (!image) throw new NotFoundException('Product image not found.');

    await this.productImageRepo.softRemove(image);
    return { message: 'Image deleted successfully.' };
  }

  async setPrimaryImage(
    imageId: string,
  ): Promise<{ message: string; data: ProductImageResponseDto }> {
    const image = await this.productImageRepo.findOne({
      where: { id: imageId },
    });
    if (!image) throw new NotFoundException('Product image not found.');

    // Unset previous primary image for this product
    await this.productImageRepo.update(
      { productId: image.productId, isPrimary: true },
      { isPrimary: false },
    );

    // Set this image as primary
    image.isPrimary = true;
    const saved = await this.productImageRepo.save(image);

    return {
      message: 'Primary image set successfully.',
      data: this.imageToResponse(saved),
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async findByIdOrFail(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found.');
    return product;
  }

  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.productRepo.findOne({ where: { slug } });
      if (!existing) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private toResponse(product: Product): ProductResponseDto {
    return plainToInstance(ProductResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }

  private imageToResponse(image: ProductImage): ProductImageResponseDto {
    return plainToInstance(ProductImageResponseDto, image, {
      excludeExtraneousValues: true,
    });
  }
}
