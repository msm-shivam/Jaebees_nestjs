import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryDto } from './dto/brand-query.dto';
import { BrandResponseDto } from './dto/brand-response.dto';
import { toSlug } from '../../common/utils/slug.util';
import { paginate } from '../../common/utils/pagination.util';
import { CatalogMessages } from '../../common/constants/messages.constants';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
  ) {}

  async create(
    dto: CreateBrandDto,
    image?: Express.Multer.File
  ): Promise<{ message: string; data: BrandResponseDto }> {
    const slug = dto.slug ?? toSlug(dto.name);
    await this.ensureSlugUnique(slug);

    const brand = this.brandRepo.create({
      name: dto.name,
      slug,
      logo: image ? `/uploads/brands/${image.filename}` : null,
      description: dto.description ?? null,
      isActive:  true,
    });

    const saved = await this.brandRepo.save(brand);
    return {
      message: 'Brand created successfully.',
      data: this.toResponse(saved),
    };
  }

  async findAll(query: BrandQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = {};
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) where.name = ILike(`%${query.search}%`);

    const [items, total] = await this.brandRepo.findAndCount({
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

  async findOne(id: string): Promise<BrandResponseDto> {
    const brand = await this.findByIdOrFail(id);
    return this.toResponse(brand);
  }

  async update(
    id: string,
    dto: UpdateBrandDto,
    image?: Express.Multer.File
  ): Promise<{ message: string; data: BrandResponseDto }> {
    const brand = await this.findByIdOrFail(id);

    if (dto.slug && dto.slug !== brand.slug) {
      await this.ensureSlugUnique(dto.slug, id);
      brand.slug = dto.slug;
    } else if (dto.name && !dto.slug && dto.name !== brand.name) {
      const newSlug = toSlug(dto.name);
      if (newSlug !== brand.slug) {
        await this.ensureSlugUnique(newSlug, id);
        brand.slug = newSlug;
      }
    }

    if (dto.name !== undefined) brand.name = dto.name;
    
    if (dto.description !== undefined) brand.description = dto.description;
    if (dto.isActive !== undefined) brand.isActive = dto.isActive;
  if (image?.filename) {
  brand.logo = `/uploads/brands/${image.filename}`;
}
    const saved = await this.brandRepo.save(brand);
    return {
      message: 'Brand updated successfully.',
      data: this.toResponse(saved),
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const brand = await this.findByIdOrFail(id);
    await this.brandRepo.softRemove(brand);
    return { message: 'Brand deleted successfully.' };
  }

  private async findByIdOrFail(id: string): Promise<Brand> {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException(CatalogMessages.BRAND_NOT_FOUND);
    return brand;
  }

  private async ensureSlugUnique(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.brandRepo.findOne({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(CatalogMessages.BRAND_SLUG_EXISTS);
    }
  }

  private toResponse(brand: Brand): BrandResponseDto {
    return plainToInstance(BrandResponseDto, brand, {
      excludeExtraneousValues: true,
    });
  }
}
