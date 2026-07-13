import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
import { ProductVariantResponseDto } from './dto/product-variant-response.dto';
import { toSlug } from '../../common/utils/slug.util';
import { paginate } from '../../common/utils/pagination.util';
import { Brand } from '../brands/entities/brand.entity';
import { Category } from '../categories/entities/category.entity';
import { SubCategory } from '../sub-categories/entities/sub-category.entity';
import { ProductCollection } from '../collections/entities/product-collection.entity';
import { ProductTagMapping } from '../product-tags/entities/product-tag-mapping.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { ProductVariantAttribute } from '../product-variants/entities/product-variant-attribute.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { AuditLogService } from '../security-compliance/services/audit-log.service';

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
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductVariantAttribute)
    private readonly variantAttributeRepo: Repository<ProductVariantAttribute>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    dto: CreateProductDto,
    adminId:string,
    files?: Express.Multer.File[],
  ): Promise<{ message: string; data: ProductResponseDto }> {
    // Validate Brand
    const brand = await this.brandRepo.findOne({ where: { id: dto.brandId } });
    if (!brand) throw new BadRequestException('Brand not found.');

    // Validate Category
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) throw new BadRequestException('Category not found.');

    // Validate SubCategory (optional)
    if (dto.subCategoryId) {
      const subCategory = await this.subCategoryRepo.findOne({
        where: { id: dto.subCategoryId },
      });
      if (!subCategory)
        throw new BadRequestException('Sub Category not found.');
      if (subCategory.categoryId !== dto.categoryId) {
        throw new BadRequestException(
          'Sub Category does not belong to the specified Category.',
        );
      }
    }

    // Generate slug
    const slug = await this.generateUniqueSlug(dto.slug ?? toSlug(dto.name));

    const product = this.productRepo.create({
      brandId: dto.brandId,
      categoryId: dto.categoryId,
      subCategoryId: dto.subCategoryId ?? null,
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

    // Save uploaded images
    if (files && files.length > 0) {
      const primaryIdx = dto.primaryImageIndex ?? 0;
      const images = files.map((file, index) =>
        this.productImageRepo.create({
          productId: saved.id,
          imageUrl: `/uploads/products/${file.filename}`,
          sortOrder: index,
          isPrimary: index === primaryIdx,
        }),
      );
      await this.productImageRepo.save(images);
    }

    // Create variants if provided
    if (dto.variants && dto.variants.length > 0) {
      await this.createVariants(saved.id, dto.variants);
    } else if (dto.sku) {
      // Auto-create default variant + inventory from simple sku field
      const existingSku = await this.variantRepo.findOne({
        where: { sku: dto.sku },
        withDeleted: true,
      });
      if (existingSku) {
        if (existingSku.deletedAt) {
          await this.variantRepo.remove(existingSku);
        } else {
          throw new ConflictException(`SKU "${dto.sku}" already exists`);
        }
      }

      const variant = this.variantRepo.create({
        productId: saved.id,
        sku: dto.sku,
        price: dto.price ?? 0,
        isDefault: true,
      });
      const savedVariant = await this.variantRepo.save(variant);

      const stockQty = dto.stockQuantity ?? 0;
      const inventory = this.inventoryRepo.create({
        variantId: savedVariant.id,
        quantity: stockQty,
        availableQuantity: stockQty,
        reservedQuantity: 0,
        lowStockThreshold: 5,
        reorderPoint: 10,
        reorderQuantity: 50,
      });
      await this.inventoryRepo.save(inventory);
    }

    const result = await this.findByIdOrFail(saved.id);
    //  await this.auditLogService.log({
    //   userId: adminId,
    //   action: 'CREATE',
    //   entityType: 'PRODUCT',
    //   entityId: saved.id,
    //   newValues: {
    //     name: saved.name,
    //     slug: saved.slug,
    //     shortDescription: saved.shortDescription,
    //     description: saved.description,
    //     status: saved.status,
    //     metaTitle: saved.metaTitle,
    //     metaDescription: saved.metaDescription,
    //     metaKeywords: saved.metaKeywords,
    //     isFeatured: saved.isFeatured,
    //     isActive: saved.isActive,
    //     brand: saved.brand,
    //     category: saved.category,
    //     subCategory: saved.subCategory,
    //     images: saved.images,
    //   },
    // });
    return {
      message: 'Product created successfully.',
      data: this.toResponse(result),
    };
  }

  async findAll(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? 'name';
    const sortOrder = query.sortOrder ?? 'ASC';

    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images');

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
      items.map((item) =>
        this.toResponse(item, item.brand?.name, item.category?.name),
      ),
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
    adminId:string,
    files?: Express.Multer.File[],
  ): Promise<{ message: string; data: ProductResponseDto }> {
    const product = await this.findByIdOrFail(id);

    if (dto.brandId !== undefined) {
      const brand = await this.brandRepo.findOne({
        where: { id: dto.brandId },
      });
      if (!brand) throw new BadRequestException('Brand not found.');
      product.brandId = dto.brandId;
    }
    if (dto.categoryId !== undefined) {
      const category = await this.categoryRepo.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) throw new BadRequestException('Category not found.');
      product.categoryId = dto.categoryId;
    }
    if (dto.subCategoryId !== undefined) {
      if (dto.subCategoryId) {
        const subCategory = await this.subCategoryRepo.findOne({
          where: { id: dto.subCategoryId },
        });
        if (!subCategory)
          throw new BadRequestException('Sub Category not found.');
        if (subCategory.categoryId !== (dto.categoryId ?? product.categoryId)) {
          throw new BadRequestException(
            'Sub Category does not belong to the specified Category.',
          );
        }
        product.subCategoryId = dto.subCategoryId;
      } else {
        product.subCategoryId = null;
      }
    }
    if (dto.slug !== undefined && dto.slug !== product.slug) {
      const slug = await this.generateUniqueSlug(dto.slug);
      product.slug = slug;
    }
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

    // Unset loaded relation objects so TypeORM uses the FK column values (not stale relations)
    if (dto.brandId !== undefined) product.brand = undefined as any;
    if (dto.categoryId !== undefined) product.category = undefined as any;
    if (dto.subCategoryId !== undefined) product.subCategory = undefined as any;

    await this.productRepo.save(product);

    // Replace collections if explicitly provided with values
    if (dto.collectionIds !== undefined && dto.collectionIds.length > 0) {
      await this.productCollectionRepo.delete({ productId: id });
      const mappings = dto.collectionIds.map((collectionId) =>
        this.productCollectionRepo.create({ productId: id, collectionId }),
      );
      await this.productCollectionRepo.save(mappings);
    }

    // Replace tags if explicitly provided with values
    if (dto.tagIds !== undefined && dto.tagIds.length > 0) {
      await this.productTagMappingRepo.delete({ productId: id });
      const mappings = dto.tagIds.map((tagId) =>
        this.productTagMappingRepo.create({ productId: id, tagId }),
      );
      await this.productTagMappingRepo.save(mappings);
    }

    // Save uploaded images (adds to existing images)
    if (files && files.length > 0) {
      // Unset existing primary so the new one takes over
      await this.productImageRepo.update(
        { productId: id, isPrimary: true },
        { isPrimary: false },
      );

      const lastSortOrder = await this.productImageRepo.maximum('sortOrder', {
        productId: id,
      });
      const primaryIdx = dto.primaryImageIndex ?? 0;
      const images = files.map((file, index) =>
        this.productImageRepo.create({
          productId: id,
          imageUrl: `/uploads/products/${file.filename}`,
          sortOrder: (lastSortOrder ?? 0) + index + 1,
          isPrimary: index === primaryIdx,
        }),
      );
      await this.productImageRepo.save(images);
    }

    // Set primary image by existing image ID
    if (dto.primaryImageId) {
      await this.productImageRepo.update(
        { productId: id, isPrimary: true },
        { isPrimary: false },
      );
      await this.productImageRepo.update(
        { id: dto.primaryImageId, productId: id },
        { isPrimary: true },
      );
    }

    // Create variants if provided (adds to existing variants)
    if (dto.variants && dto.variants.length > 0) {
      await this.createVariants(id, dto.variants);
    } else if (dto.sku) {
      let variant = await this.variantRepo.findOne({
        where: { productId: id, sku: dto.sku },
      });
      if (!variant) {
        const dup = await this.variantRepo.findOne({
          where: { sku: dto.sku },
          withDeleted: true,
        });
        if (dup) {
          if (dup.deletedAt) {
            await this.variantRepo.remove(dup);
          } else {
            throw new ConflictException(`SKU "${dto.sku}" already exists`);
          }
        }
        variant = this.variantRepo.create({
          productId: id,
          sku: dto.sku,
          price: dto.price ?? 0,
          isDefault: true,
        });
        const savedVariant = await this.variantRepo.save(variant);
        const stockQty = dto.stockQuantity ?? 0;
        const inventory = this.inventoryRepo.create({
          variantId: savedVariant.id,
          quantity: stockQty,
          availableQuantity: stockQty,
          reservedQuantity: 0,
          lowStockThreshold: 5,
          reorderPoint: 10,
          reorderQuantity: 50,
        });
        await this.inventoryRepo.save(inventory);
      } else if (dto.price !== undefined) {
        variant.price = dto.price;
        await this.variantRepo.save(variant);
      }
    }

    const result = await this.findByIdOrFail(id);
    // await this.auditLogService.log({
    //   userId: adminId,
    //   action: 'UPDATE',
    //   entityType: 'PRODUCT',
    //   entityId: result.id,
    //   newValues: {
    //     name: result.name,
    //     slug: result.slug,
    //     shortDescription: result.shortDescription,
    //     description: result.description,
    //     status: result.status,
    //     metaTitle: result.metaTitle,
    //     metaDescription: result.metaDescription,
    //     metaKeywords: result.metaKeywords,
    //     isFeatured: result.isFeatured,
    //     isActive: result.isActive,
    //     brand: result.brand,
    //     category: result.category,
    //     subCategory: result.subCategory,
    //   },
    // });
    return {
      message: 'Product updated successfully.',
      data: this.toResponse(result),
    };
  }

  async remove(id: string,adminId:string): Promise<{ message: string }> {
    const product = await this.findByIdOrFail(id);
    await this.productRepo.softRemove(product);
    //  await this.auditLogService.log({
    //   userId: adminId,
    //   action: 'DELETE',
    //   entityType: 'PRODUCT',
    //   entityId: product.id,
    //   newValues: {
    //     name: product.name,
    //     slug: product.slug,
    //     shortDescription: product.shortDescription,
    //     description: product.description,
    //     status: product.status,
    //     metaTitle: product.metaTitle,
    //     metaDescription: product.metaDescription,
    //     metaKeywords: product.metaKeywords,
    //     isFeatured: product.isFeatured,
    //     isActive: product.isActive,
    //     brand: product.brand,
    //     category: product.category,
    //     subCategory: product.subCategory,
    //   },
    // });
    return { message: 'Product deleted successfully.' };
  }

  async bulkRemove(ids: string[],adminId:string): Promise<{ message: string }> {
    const products = await this.productRepo.find({
      where: { id: In(ids) },
    });
    if (!products.length) {
      throw new NotFoundException('No products found for the given IDs.');
    }
    await this.productRepo.softRemove(products);
    //  await this.auditLogService.log({
    //   userId: adminId,
    //   action: 'DELETE',
    //   entityType: 'PRODUCT',
    //   newValues: { ProductName: products.map((p) => p.name) },
    // });
    return { message: `${products.length} product(s) deleted successfully.` };
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
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { brand: true, category: true, images: true, variants: true },
    });
    if (!product) throw new NotFoundException('Product not found.');
    return product;
  }

  private async createVariants(productId: string, variants: Array<{ sku: string; price: number; compareAtPrice?: number; costPrice?: number; isDefault?: boolean; attributes?: Array<{ attributeId: string; attributeValueId: string }> }>) {
    for (const v of variants) {
      const existingSku = await this.variantRepo.findOne({
        where: { sku: v.sku },
        withDeleted: true,
      });
      if (existingSku) {
        if (existingSku.deletedAt) {
          await this.variantRepo.remove(existingSku);
        } else {
          throw new ConflictException(`SKU "${v.sku}" already exists`);
        }
      }

      const variant = this.variantRepo.create({
        productId,
        sku: v.sku,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        costPrice: v.costPrice,
        isDefault: v.isDefault || false,
      });
      const saved = await this.variantRepo.save(variant);

      if (v.attributes && v.attributes.length > 0) {
        const mappings = v.attributes.map((a) =>
          this.variantAttributeRepo.create({
            variantId: saved.id,
            attributeId: a.attributeId,
            attributeValueId: a.attributeValueId,
          }),
        );
        await this.variantAttributeRepo.save(mappings);
      }
    }
  }

  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.productRepo.findOne({ where: { slug }, withDeleted: true });
      if (!existing) break;

      if (existing.deletedAt) {
        await this.productRepo.remove(existing);
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private toResponse(
    product: Product,
    brandName?: string,
    categoryName?: string,
  ): ProductResponseDto {
    const images = (product.images ?? []).map((img) =>
      this.imageToResponse(img),
    );
    const variants = (product.variants ?? []).map((v) =>
      this.variantToResponse(v),
    );
    return plainToInstance(
      ProductResponseDto,
      {
        ...product,
        images,
        variants,
        brandName: brandName ?? product.brand?.name ?? null,
        categoryName: categoryName ?? product.category?.name ?? null,
      },
      { excludeExtraneousValues: true },
    );
  }

  private imageToResponse(image: ProductImage): ProductImageResponseDto {
    return plainToInstance(ProductImageResponseDto, image, {
      excludeExtraneousValues: true,
    });
  }

  private variantToResponse(variant: ProductVariant): ProductVariantResponseDto {
    return plainToInstance(ProductVariantResponseDto, variant, {
      excludeExtraneousValues: true,
    });
  }
}
