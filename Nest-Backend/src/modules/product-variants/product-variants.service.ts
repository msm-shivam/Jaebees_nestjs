import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductVariantAttribute } from './entities/product-variant-attribute.entity';
import { Product } from '../products/entities/product.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { AttributeValue } from '../attribute-values/entities/attribute-value.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariantQueryDto } from './dto/product-variant-query.dto';
import { ProductVariantResponseDto } from './dto/product-variant-response.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductVariantAttribute)
    private readonly variantAttributeRepo: Repository<ProductVariantAttribute>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Attribute)
    private readonly attributeRepo: Repository<Attribute>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepo: Repository<AttributeValue>,
  ) {}

  async create(dto: CreateProductVariantDto) {
    // Validate product exists
    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Validate SKU uniqueness
    const existingSku = await this.variantRepo.findOne({
      where: { sku: dto.sku },
    });
    if (existingSku) {
      throw new ConflictException('SKU already exists');
    }

    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.variantRepo.update(
        { productId: dto.productId, isDefault: true },
        { isDefault: false },
      );
    }

    // Create variant
    const variant = this.variantRepo.create({
      productId: dto.productId,
      sku: dto.sku,
      barcode: dto.barcode,
      price: dto.price,
      compareAtPrice: dto.compareAtPrice,
      costPrice: dto.costPrice,
      weight: dto.weight,
      status: dto.status,
      isDefault: dto.isDefault || false,
    });

    const savedVariant = await this.variantRepo.save(variant);

    // Assign attributes if provided
    if (dto.attributes && dto.attributes.length > 0) {
      await this.assignAttributes(savedVariant.id, dto.attributes);
    }

    return this.toResponse(savedVariant);
  }

  async findAll(query: ProductVariantQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const queryBuilder = this.variantRepo.createQueryBuilder('variant');

    // Product filter
    if (query.productId) {
      queryBuilder.andWhere('variant.productId = :productId', { productId: query.productId });
    }

    // Status filter
    if (query.status) {
      queryBuilder.andWhere('variant.status = :status', { status: query.status });
    }

    // Search by SKU
    if (query.search) {
      queryBuilder.andWhere('variant.sku ILIKE :search', { search: `%${query.search}%` });
    }

    // Sorting
    const validSortFields = ['price', 'createdAt', 'updatedAt', 'sku'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy({ [`variant.${sortField}`]: sortOrder });

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

  async findOne(id: string) {
    const variant = await this.variantRepo.findOne({
      where: { id },
      relations: { attributes: { attribute: true, attributeValue: true } },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return this.toResponse(variant);
  }

  async update(id: string, dto: UpdateProductVariantDto) {
    const variant = await this.variantRepo.findOne({ where: { id } });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Validate SKU uniqueness if being updated
    if (dto.sku && dto.sku !== variant.sku) {
      const existingSku = await this.variantRepo.findOne({
        where: { sku: dto.sku },
      });
      if (existingSku) {
        throw new ConflictException('SKU already exists');
      }
    }

    // If setting as default, unset other defaults
    if (dto.isDefault && !variant.isDefault) {
      await this.variantRepo.update(
        { productId: variant.productId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(variant, dto);
    const updatedVariant = await this.variantRepo.save(variant);

    return this.toResponse(updatedVariant);
  }

  async remove(id: string) {
    const variant = await this.variantRepo.findOne({ where: { id } });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    await this.variantRepo.softRemove(variant);
    return { message: 'Variant deleted successfully' };
  }

  async setAsDefault(id: string) {
    const variant = await this.variantRepo.findOne({ where: { id } });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Unset other defaults for this product
    await this.variantRepo.update(
      { productId: variant.productId, isDefault: true },
      { isDefault: false },
    );

    // Set this variant as default
    variant.isDefault = true;
    await this.variantRepo.save(variant);

    return this.toResponse(variant);
  }

  async assignAttributes(variantId: string, attributes: Array<{ attributeId: string; attributeValueId: string }>) {
    const variant = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    for (const attr of attributes) {
      // Validate attribute exists
      const attribute = await this.attributeRepo.findOne({
        where: { id: attr.attributeId },
      });
      if (!attribute) {
        throw new NotFoundException(`Attribute ${attr.attributeId} not found`);
      }

      // Validate attribute value exists
      const attributeValue = await this.attributeValueRepo.findOne({
        where: { id: attr.attributeValueId },
      });
      if (!attributeValue) {
        throw new NotFoundException(`Attribute value ${attr.attributeValueId} not found`);
      }

      // Validate attribute value belongs to attribute
      if (attributeValue.attributeId !== attr.attributeId) {
        throw new BadRequestException('Attribute value does not belong to the attribute');
      }

      // Check for duplicate mapping
      const existingMapping = await this.variantAttributeRepo.findOne({
        where: {
          variantId,
          attributeId: attr.attributeId,
        },
      });

      if (existingMapping) {
        throw new ConflictException(`Attribute ${attribute.name} is already assigned to this variant`);
      }

      // Create mapping
      const mapping = this.variantAttributeRepo.create({
        variantId,
        attributeId: attr.attributeId,
        attributeValueId: attr.attributeValueId,
      });

      await this.variantAttributeRepo.save(mapping);
    }

    return this.findOne(variantId);
  }

  async removeAttribute(variantId: string, mappingId: string) {
    const mapping = await this.variantAttributeRepo.findOne({
      where: { id: mappingId, variantId },
    });

    if (!mapping) {
      throw new NotFoundException('Attribute mapping not found');
    }

    await this.variantAttributeRepo.remove(mapping);
    return { message: 'Attribute removed successfully' };
  }

  private toResponse(variant: ProductVariant): ProductVariantResponseDto {
    return {
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      barcode: variant.barcode,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      costPrice: variant.costPrice,
      weight: variant.weight,
      status: variant.status,
      isDefault: variant.isDefault,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
      deletedAt: variant.deletedAt,
    };
  }
}
