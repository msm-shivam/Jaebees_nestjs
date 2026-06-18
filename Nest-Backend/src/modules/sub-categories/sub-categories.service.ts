import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { SubCategory } from './entities/sub-category.entity';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategoryQueryDto } from './dto/sub-category-query.dto';
import { SubCategoryResponseDto } from './dto/sub-category-response.dto';
import { CategoriesService } from '../categories/categories.service';
import { toSlug } from '../../common/utils/slug.util';
import { paginate } from '../../common/utils/pagination.util';
import { CatalogMessages } from '../../common/constants/messages.constants';

@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(
    dto: CreateSubCategoryDto,
  ): Promise<{ message: string; data: SubCategoryResponseDto }> {
    const category = await this.categoriesService.findByIdOrFail(
      dto.categoryId,
    );

    const slug = dto.slug ?? toSlug(dto.name);
    await this.ensureSlugUnique(slug);

    const subCategory = this.subCategoryRepo.create({
      categoryId: dto.categoryId,
      name: dto.name,
      slug,
      image: dto.image ?? null,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.subCategoryRepo.save(subCategory);
    saved.category = category;
    return {
      message: 'Sub category created successfully.',
      data: this.toResponse(saved),
    };
  }

  async findAll(query: SubCategoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = {};
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) where.name = ILike(`%${query.search}%`);

    const [items, total] = await this.subCategoryRepo.findAndCount({
      where,
      relations: { category: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
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

  async findOne(id: string): Promise<SubCategoryResponseDto> {
    const subCategory = await this.findByIdOrFail(id);
    return this.toResponse(subCategory);
  }

  async update(
    id: string,
    dto: UpdateSubCategoryDto,
  ): Promise<{ message: string; data: SubCategoryResponseDto }> {
    const subCategory = await this.findByIdOrFail(id);

    if (dto.slug && dto.slug !== subCategory.slug) {
      await this.ensureSlugUnique(dto.slug, id);
      subCategory.slug = dto.slug;
    } else if (dto.name && !dto.slug && dto.name !== subCategory.name) {
      const newSlug = toSlug(dto.name);
      if (newSlug !== subCategory.slug) {
        await this.ensureSlugUnique(newSlug, id);
        subCategory.slug = newSlug;
      }
    }

    if (dto.name !== undefined) subCategory.name = dto.name;
    if (dto.image !== undefined) subCategory.image = dto.image;
    if (dto.description !== undefined)
      subCategory.description = dto.description;
    if (dto.sortOrder !== undefined) subCategory.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) subCategory.isActive = dto.isActive;

    const saved = await this.subCategoryRepo.save(subCategory);
    saved.category = subCategory.category;
    return {
      message: 'Sub category updated successfully.',
      data: this.toResponse(saved),
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const subCategory = await this.findByIdOrFail(id);
    await this.subCategoryRepo.softRemove(subCategory);
    return { message: 'Sub category deleted successfully.' };
  }

  private async findByIdOrFail(id: string): Promise<SubCategory> {
    const subCategory = await this.subCategoryRepo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!subCategory) {
      throw new NotFoundException(CatalogMessages.SUB_CATEGORY_NOT_FOUND);
    }
    return subCategory;
  }

  private async ensureSlugUnique(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.subCategoryRepo.findOne({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(CatalogMessages.SUB_CATEGORY_SLUG_EXISTS);
    }
  }

  private toResponse(subCategory: SubCategory): SubCategoryResponseDto {
    return plainToInstance(
      SubCategoryResponseDto,
      { ...subCategory, categoryName: subCategory.category?.name ?? null },
      { excludeExtraneousValues: true },
    );
  }
}
