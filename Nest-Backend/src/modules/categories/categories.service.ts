import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Category } from './entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { toSlug } from '../../common/utils/slug.util';
import { paginate } from '../../common/utils/pagination.util';
import { CatalogMessages } from '../../common/constants/messages.constants';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
  ) {}

  async create(
    dto: CreateCategoryDto,
    image: Express.Multer.File,
  ): Promise<{ message: string; data: CategoryResponseDto }> {
    const slug = dto.slug ?? toSlug(dto.name);
    await this.ensureSlugUnique(slug);

    let brands: Brand[] = [];
    if (dto.brandIds && dto.brandIds.length > 0) {
      brands = await this.brandRepo.find({
        where: { id: In(dto.brandIds) },
      });
      if (brands.length !== dto.brandIds.length) {
        throw new BadRequestException('One or more brands not found.');
      }
    }

    const category = this.categoryRepo.create({
      name: dto.name,
      slug,
      image: image?.filename ? `/uploads/categories/${image.filename}` : null,
      description: dto.description ?? null,
      sortOrder: 0,
      isActive: true,
      brands,
    });

    const saved = await this.categoryRepo.save(category);
    return {
      message: 'Category created successfully.',
      data: this.toResponse(saved),
    };
  }

  async findAll(query: CategoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = {};
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) where.name = ILike(`%${query.search}%`);

    const [items, total] = await this.categoryRepo.findAndCount({
      where,
      relations: { brands: true },
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

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.findByIdOrFail(id);
    return this.toResponse(category);
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    image?: Express.Multer.File,
  ): Promise<{ message: string; data: CategoryResponseDto }> {
    const category = await this.findByIdOrFail(id);

    if (dto.slug && dto.slug !== category.slug) {
      await this.ensureSlugUnique(dto.slug, id);
      category.slug = dto.slug;
    } else if (dto.name && !dto.slug && dto.name !== category.name) {
      const newSlug = toSlug(dto.name);
      if (newSlug !== category.slug) {
        await this.ensureSlugUnique(newSlug, id);
        category.slug = newSlug;
      }
    }

    if (dto.name !== undefined) category.name = dto.name;
    if (image) {
      category.image = `/uploads/categories/${image.filename}`;
    }
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    // Replace brand links if provided
    if (dto.brandIds !== undefined) {
      const brands = await this.brandRepo.find({
        where: { id: In(dto.brandIds) },
      });
      if (brands.length !== dto.brandIds.length) {
        throw new BadRequestException('One or more brands not found.');
      }
      category.brands = brands;
    }

    const saved = await this.categoryRepo.save(category);
    return {
      message: 'Category updated successfully.',
      data: this.toResponse(saved),
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findByIdOrFail(id);
    await this.categoryRepo.softRemove(category);
    return { message: 'Category deleted successfully.' };
  }

  async findByIdOrFail(id: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: { brands: true },
    });
    if (!category)
      throw new NotFoundException(CatalogMessages.CATEGORY_NOT_FOUND);
    return category;
  }

  private async ensureSlugUnique(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.categoryRepo.findOne({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(CatalogMessages.CATEGORY_SLUG_EXISTS);
    }
  }

  private toResponse(category: Category): CategoryResponseDto {
    return plainToInstance(CategoryResponseDto, category, {
      excludeExtraneousValues: true,
    });
  }
}
