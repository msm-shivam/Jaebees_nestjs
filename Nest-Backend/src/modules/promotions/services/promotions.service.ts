import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Promotion } from '../entities/promotion.entity';
import { DiscountRule } from '../entities/discount-rule.entity';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';
import { PromotionQueryDto } from '../dto/promotion-query.dto';
import { PromotionStatus } from '../enums/promotion-status.enum';
import {
  paginate,
  PaginatedResult,
} from '../../../common/utils/pagination.util';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(DiscountRule)
    private readonly discountRuleRepository: Repository<DiscountRule>,
  ) {}

  async create(dto: CreatePromotionDto): Promise<Promotion> {
    const { rules, ...data } = dto;
    const promotion = this.promotionRepository.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
    const saved = await this.promotionRepository.save(promotion);
    if (rules && rules.length > 0) {
      const ruleEntities = rules.map((r) =>
        this.discountRuleRepository.create({ ...r, promotionId: saved.id }),
      );
      await this.discountRuleRepository.save(ruleEntities);
    }
    return this.findById(saved.id);
  }

  async findAll(query: PromotionQueryDto): Promise<PaginatedResult<Promotion>> {
    const where: Record<string, unknown> = {};
    if (query.status) {
      where.status = query.status;
    }
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const [items, total] = await this.promotionRepository.findAndCount({
      where,
      relations: { discountRules: true },
      order: { priority: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(items, total, page, limit);
  }

  async findById(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: { discountRules: true },
    });
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }
    return promotion;
  }

  async update(id: string, dto: UpdatePromotionDto): Promise<Promotion> {
    const promotion = await this.findById(id);
    const { rules, ...data } = dto;
    Object.assign(promotion, data);
    if (data.startDate) promotion.startDate = new Date(data.startDate);
    if (data.endDate) promotion.endDate = new Date(data.endDate);
    await this.promotionRepository.save(promotion);
    if (rules !== undefined) {
      await this.discountRuleRepository.delete({ promotionId: id });
      if (rules.length > 0) {
        const ruleEntities = rules.map((r) =>
          this.discountRuleRepository.create({ ...r, promotionId: id }),
        );
        await this.discountRuleRepository.save(ruleEntities);
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
        status: PromotionStatus.ACTIVE,
        startDate: LessThan(now),
        endDate: MoreThan(now),
      },
      relations: { discountRules: true },
      order: { priority: 'DESC' },
    });
  }

  async autoExpirePromotions(): Promise<number> {
    const now = new Date();
    const result = await this.promotionRepository.update(
      {
        status: PromotionStatus.ACTIVE,
        endDate: LessThan(now),
      },
      { status: PromotionStatus.EXPIRED },
    );
    return result.affected || 0;
  }
}
