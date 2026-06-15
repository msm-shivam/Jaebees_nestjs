import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Like } from 'typeorm';
import { Promotion } from '../entities/promotion.entity';
import { PromotionProduct } from '../entities/promotion-product.entity';
import { PromotionCategory } from '../entities/promotion-category.entity';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';
import { PromotionQueryDto } from '../dto/promotion-query.dto';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(PromotionProduct)
    private readonly promotionProductRepository: Repository<PromotionProduct>,
    @InjectRepository(PromotionCategory)
    private readonly promotionCategoryRepository: Repository<PromotionCategory>,
  ) {}

  async create(dto: CreatePromotionDto): Promise<Promotion> {
    const promotion = this.promotionRepository.create({
      name: dto.name,
      description: dto.description,
      type: dto.type,
      discountValue: dto.discountValue,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      isActive: dto.isActive ?? true,
      priority: dto.priority ?? 0,
      isStackable: dto.isStackable ?? false,
      autoApply: dto.autoApply ?? false,
    });
    const saved = await this.promotionRepository.save(promotion);

    if (dto.productIds?.length) {
      const products = dto.productIds.map((productId) =>
        this.promotionProductRepository.create({
          promotionId: saved.id,
          productId,
        }),
      );
      await this.promotionProductRepository.save(products);
    }

    if (dto.categoryIds?.length) {
      const categories = dto.categoryIds.map((categoryId) =>
        this.promotionCategoryRepository.create({
          promotionId: saved.id,
          categoryId,
        }),
      );
      await this.promotionCategoryRepository.save(categories);
    }

    return this.findById(saved.id);
  }

  async findAll(
    query: PromotionQueryDto,
  ): Promise<{ items: Promotion[]; total: number }> {
    const { search, type, isActive, page = 1, limit = 20 } = query;
    const where: any = {};
    if (search) {
      where.name = Like(`%${search}%`);
    }
    if (type) {
      where.type = type;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    const [items, total] = await this.promotionRepository.findAndCount({
      where,
      relations: { promotionProducts: true, promotionCategories: true },
      order: { priority: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async findById(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: { promotionProducts: true, promotionCategories: true },
    });
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID "${id}" not found`);
    }
    return promotion;
  }

  async update(id: string, dto: UpdatePromotionDto): Promise<Promotion> {
    await this.findById(id);
    const updateData: any = { ...dto };
    if (dto.startDate) {
      updateData.startDate = new Date(dto.startDate);
    }
    if (dto.endDate) {
      updateData.endDate = new Date(dto.endDate);
    }
    await this.promotionRepository.update(id, updateData);

    if (dto.productIds !== undefined) {
      await this.promotionProductRepository.delete({ promotionId: id });
      if (dto.productIds.length) {
        const products = dto.productIds.map((productId) =>
          this.promotionProductRepository.create({
            promotionId: id,
            productId,
          }),
        );
        await this.promotionProductRepository.save(products);
      }
    }

    if (dto.categoryIds !== undefined) {
      await this.promotionCategoryRepository.delete({ promotionId: id });
      if (dto.categoryIds.length) {
        const categories = dto.categoryIds.map((categoryId) =>
          this.promotionCategoryRepository.create({
            promotionId: id,
            categoryId,
          }),
        );
        await this.promotionCategoryRepository.save(categories);
      }
    }

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const promotion = await this.findById(id);
    await this.promotionRepository.remove(promotion);
  }

  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    return this.promotionRepository.find({
      where: {
        isActive: true,
        startDate: LessThan(now),
        endDate: MoreThan(now),
      },
      relations: { promotionProducts: true, promotionCategories: true },
      order: { priority: 'DESC' },
    });
  }

  async autoExpirePromotions(): Promise<number> {
    const now = new Date();
    const result = await this.promotionRepository.update(
      { isActive: true, endDate: LessThan(now) },
      { isActive: false },
    );
    return result.affected ?? 0;
  }
}
