import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Brand } from './entities/brand.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryDto } from './dto/brand-query.dto';
import { BrandResponseDto } from './dto/brand-response.dto';
import { CategoryResponseDto } from '../categories/dto/category-response.dto';
import { toSlug } from '../../common/utils/slug.util';
import { paginate } from '../../common/utils/pagination.util';
import { CatalogMessages } from '../../common/constants/messages.constants';
import { AuditLogService } from '../security-compliance/services/audit-log.service';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    dto: CreateBrandDto,
    adminId:string,
    image?: Express.Multer.File,
  ): Promise<{ message: string; data: BrandResponseDto }> {
    const slug = dto.slug ?? toSlug(dto.name);
    await this.ensureSlugUnique(slug);

    let categories: Category[] = [];
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      categories = await this.categoryRepo.find({
        where: { id: In(dto.categoryIds) },
      });
      if (categories.length !== dto.categoryIds.length) {
        throw new BadRequestException('One or more categories not found.');
      }
    }

    const brand = this.brandRepo.create({
      name: dto.name,
      slug,
      logo: image ? `/uploads/brands/${image.filename}` : null,
      description: dto.description ?? null,
      isActive: true,
      categories,
    });

    const saved = await this.brandRepo.save(brand);
    await this.auditLogService.log({
      userId: adminId,
      action: 'CREATE',
      entityType: 'BRAND',
      entityId: saved.id,
      newValues: {
        name: saved.name,
        slug: saved.slug,
        logo: saved.logo,
        description: saved.description,
        isActive: saved.isActive,
        categories: saved.categories,
      },
    });
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
      relations: { categories: true },
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
    adminId:string,
    image?: Express.Multer.File,
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

    // Replace category links if provided
    if (dto.categoryIds !== undefined) {
      const categories = await this.categoryRepo.find({
        where: { id: In(dto.categoryIds) },
      });
      if (categories.length !== dto.categoryIds.length) {
        throw new BadRequestException('One or more categories not found.');
      }
      brand.categories = categories;
    }

    const saved = await this.brandRepo.save(brand);
   await this.auditLogService.log({
      userId: adminId,
      action: 'UPDATE',
      entityType: 'BRAND',
      entityId: brand.id,
      newValues: {
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
        description: brand.description,
        isActive: brand.isActive,
        categories: brand.categories,
      },
    });
    return {
      message: 'Brand updated successfully.',
      data: this.toResponse(saved),
    };
  }

  async remove(id: string,adminId:string): Promise<{ message: string }> {
    const brand = await this.findByIdOrFail(id);
    await this.brandRepo.softRemove(brand);
    await this.auditLogService.log({
      userId: adminId,
      action: 'DELETE',
      entityType: 'BRAND',
      entityId: brand.id,
      newValues: {
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
        description: brand.description,
        isActive: brand.isActive,
        categories: brand.categories,
      },
    });
    return { message: 'Brand deleted successfully.' };
  }

  async findBrandCategories(id: string) {
    const brand = await this.findByIdOrFail(id);
    return brand.categories.map((cat) =>
      plainToInstance(CategoryResponseDto, cat, {
        excludeExtraneousValues: true,
      }),
    );
  }

  private async findByIdOrFail(id: string): Promise<Brand> {
    const brand = await this.brandRepo.findOne({
      where: { id },
      relations: { categories: true },
    });
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
