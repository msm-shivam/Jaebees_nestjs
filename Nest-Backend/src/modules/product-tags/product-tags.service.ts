import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ProductTag } from './entities/product-tag.entity';
import { CreateProductTagDto } from './dto/create-product-tag.dto';
import { UpdateProductTagDto } from './dto/update-product-tag.dto';
import { ProductTagQueryDto } from './dto/product-tag-query.dto';
import { ProductTagResponseDto } from './dto/product-tag-response.dto';
import { toSlug } from '../../common/utils/slug.util';
import { paginate } from '../../common/utils/pagination.util';
import { CatalogMessages } from '../../common/constants/messages.constants';

@Injectable()
export class ProductTagsService {
  constructor(
    @InjectRepository(ProductTag)
    private readonly productTagRepo: Repository<ProductTag>,
  ) {}

  async create(
    dto: CreateProductTagDto,
  ): Promise<{ message: string; data: ProductTagResponseDto }> {
    const slug = dto.slug ?? toSlug(dto.name);
    await this.ensureSlugUnique(slug);

    const tag = this.productTagRepo.create({
      name: dto.name,
      slug,
    });

    const saved = await this.productTagRepo.save(tag);
    return {
      message: 'Product tag created successfully.',
      data: this.toResponse(saved),
    };
  }

  async findAll(query: ProductTagQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = {};
    if (query.search) where.name = ILike(`%${query.search}%`);

    const [items, total] = await this.productTagRepo.findAndCount({
      where,
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(
      items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<ProductTagResponseDto> {
    const tag = await this.findByIdOrFail(id);
    return this.toResponse(tag);
  }

  async update(
    id: string,
    dto: UpdateProductTagDto,
  ): Promise<{ message: string; data: ProductTagResponseDto }> {
    const tag = await this.findByIdOrFail(id);

    if (dto.slug && dto.slug !== tag.slug) {
      await this.ensureSlugUnique(dto.slug, id);
      tag.slug = dto.slug;
    } else if (dto.name && !dto.slug && dto.name !== tag.name) {
      const newSlug = toSlug(dto.name);
      if (newSlug !== tag.slug) {
        await this.ensureSlugUnique(newSlug, id);
        tag.slug = newSlug;
      }
    }

    if (dto.name !== undefined) tag.name = dto.name;

    const saved = await this.productTagRepo.save(tag);
    return {
      message: 'Product tag updated successfully.',
      data: this.toResponse(saved),
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const tag = await this.findByIdOrFail(id);
    await this.productTagRepo.remove(tag);
    return { message: 'Product tag deleted successfully.' };
  }

  private async findByIdOrFail(id: string): Promise<ProductTag> {
    const tag = await this.productTagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException(CatalogMessages.TAG_NOT_FOUND);
    return tag;
  }

  private async ensureSlugUnique(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.productTagRepo.findOne({ where: { slug }, withDeleted: true });
    if (!existing) return;
    if (existing.id === excludeId) return;
    if (existing.deletedAt) {
      await this.productTagRepo.remove(existing);
      return;
    }
    throw new BadRequestException(CatalogMessages.TAG_SLUG_EXISTS);
  }

  private toResponse(tag: ProductTag): ProductTagResponseDto {
    return plainToInstance(ProductTagResponseDto, tag, {
      excludeExtraneousValues: true,
    });
  }
}
